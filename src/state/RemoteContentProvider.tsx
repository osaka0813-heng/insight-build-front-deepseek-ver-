import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  REMOTE_CONTENT_CACHE_KEY,
  REMOTE_CONTENT_FETCH_TIMEOUT_MS,
  REMOTE_CONTENT_MIN_REFRESH_INTERVAL_MS,
  REMOTE_CONTENT_URL,
} from '../config/remoteContent';
import { localContentBundle } from '../data/localContentBundle';
import {
  getRuntimeContentRevision,
  replaceRuntimeContentBundle,
  subscribeRuntimeContent,
} from '../engine/runtimeContentStore';
import { validateRemoteContentBundle } from '../engine/remoteContentValidator';
import type { RemoteContentBundle, RemoteContentStatus } from '../types/remoteContent';

type RemoteContentContextValue = {
  status: RemoteContentStatus;
  refresh: (expectedContentVersion?: string) => Promise<boolean>;
  installPublishedContent: (bundle: RemoteContentBundle) => Promise<void>;
  revision: number;
};

const initialStatus: RemoteContentStatus = {
  phase: 'booting',
  source: 'local',
  contentVersion: localContentBundle.contentVersion,
  generatedAt: localContentBundle.generatedAt,
};

const RemoteContentContext = createContext<RemoteContentContextValue | null>(null);

async function readCachedBundle(): Promise<RemoteContentBundle | undefined> {
  const cached = await AsyncStorage.getItem(REMOTE_CONTENT_CACHE_KEY);
  if (!cached) return undefined;
  return validateRemoteContentBundle(JSON.parse(cached));
}

async function fetchRemoteBundle(url: string): Promise<RemoteContentBundle> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_CONTENT_FETCH_TIMEOUT_MS);
  try {
    const separator = url.includes('?') ? '&' : '?';
    const requestUrl = `${url}${separator}insight_ts=${Date.now()}`;
    const response = await fetch(requestUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Remote content request failed (${response.status}).`);
    return validateRemoteContentBundle(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

export function RemoteContentProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<RemoteContentStatus>(initialStatus);
  const lastCheckRef = useRef(0);
  const revision = useSyncExternalStore(
    subscribeRuntimeContent,
    getRuntimeContentRevision,
    getRuntimeContentRevision,
  );

  const apply = useCallback((bundle: RemoteContentBundle, source: 'cache' | 'remote') => {
    replaceRuntimeContentBundle(bundle);
    setStatus((current) => ({
      ...current,
      phase: 'ready',
      source,
      contentVersion: bundle.contentVersion,
      generatedAt: bundle.generatedAt,
      lastSuccessfulSyncAt: new Date().toISOString(),
      error: undefined,
    }));
  }, []);

  const installPublishedContent = useCallback(async (bundle: RemoteContentBundle) => {
    const validated = validateRemoteContentBundle(bundle);
    apply(validated, 'remote');
    await AsyncStorage.setItem(
      REMOTE_CONTENT_CACHE_KEY,
      JSON.stringify(validated),
    );
  }, [apply]);

  const refresh = useCallback(async (expectedContentVersion?: string): Promise<boolean> => {
    const maxAttempts = expectedContentVersion ? 10 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const checkedAt = new Date().toISOString();
      lastCheckRef.current = Date.now();

      if (!REMOTE_CONTENT_URL.trim()) {
        setStatus((current) => ({
          ...current,
          phase: 'ready',
          source: current.source,
          lastCheckedAt: checkedAt,
          error: undefined,
        }));
        return false;
      }

      setStatus((current) => ({
        ...current,
        phase: 'refreshing',
        lastCheckedAt: checkedAt,
      }));

      try {
        const remote = await fetchRemoteBundle(REMOTE_CONTENT_URL.trim());

        if (
          expectedContentVersion &&
          remote.contentVersion !== expectedContentVersion
        ) {
          console.info(
            `[Insight] Waiting for published content. Expected ${expectedContentVersion}, received ${remote.contentVersion}. Attempt ${attempt}/${maxAttempts}.`,
          );

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1800));
            continue;
          }

          setStatus((current) => ({
            ...current,
            phase: 'ready',
            lastCheckedAt: checkedAt,
            error: 'The publish succeeded, but the public content endpoint is still serving the previous version.',
          }));
          return false;
        }

        apply(remote, 'remote');
        console.info(`[Insight] Remote content loaded: ${remote.contentVersion}`);
        await AsyncStorage.setItem(REMOTE_CONTENT_CACHE_KEY, JSON.stringify(remote));
        return true;
      } catch (error) {
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1800));
          continue;
        }

        console.warn(
          '[Insight] Remote content sync failed; keeping last known-good content.',
          error,
        );
        setStatus((current) => ({
          ...current,
          phase: 'ready',
          lastCheckedAt: checkedAt,
          error:
            error instanceof Error
              ? error.message
              : 'Remote content sync failed.',
        }));
        return false;
      }
    }

    return false;
  }, [apply]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        const cached = await readCachedBundle();
        if (mounted && cached) apply(cached, 'cache');
      } catch {
        await AsyncStorage.removeItem(REMOTE_CONTENT_CACHE_KEY).catch(() => undefined);
      } finally {
        if (mounted) {
          setStatus((current) => ({ ...current, phase: 'ready' }));
          await refresh();
        }
      }
    }
    void bootstrap();
    return () => { mounted = false; };
  }, [apply, refresh]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (
        nextState === 'active' &&
        Date.now() - lastCheckRef.current >= REMOTE_CONTENT_MIN_REFRESH_INTERVAL_MS
      ) {
        void refresh();
      }
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [refresh]);

  const value = useMemo(
    () => ({ status, refresh, installPublishedContent, revision }),
    [installPublishedContent, refresh, revision, status],
  );
  return <RemoteContentContext.Provider value={value}>{children}</RemoteContentContext.Provider>;
}

export function useRemoteContent(): RemoteContentContextValue {
  const value = useContext(RemoteContentContext);
  if (!value) throw new Error('useRemoteContent must be used inside RemoteContentProvider.');
  return value;
}
