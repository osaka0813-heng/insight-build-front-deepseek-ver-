import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@insight/living-memory-v1';

type StoredMemory = {
  followedProcessIds: string[];
  lastProcessId?: string;
  lastInsightByProcess: Record<string, string>;
};

type LivingMemoryValue = StoredMemory & {
  hydrated: boolean;
  isFollowing: (processId: string) => boolean;
  toggleFollow: (processId: string) => void;
  rememberProcess: (processId: string) => void;
  rememberInsight: (processId: string, insightId: string) => void;
};

const initialMemory: StoredMemory = {
  followedProcessIds: [],
  lastInsightByProcess: {},
};

const LivingMemoryContext = createContext<LivingMemoryValue | null>(null);

function sanitize(value: unknown): StoredMemory {
  if (!value || typeof value !== 'object') return initialMemory;
  const raw = value as Partial<StoredMemory>;
  return {
    followedProcessIds: Array.isArray(raw.followedProcessIds)
      ? raw.followedProcessIds.filter((id): id is string => typeof id === 'string')
      : [],
    lastProcessId: typeof raw.lastProcessId === 'string' ? raw.lastProcessId : undefined,
    lastInsightByProcess:
      raw.lastInsightByProcess && typeof raw.lastInsightByProcess === 'object'
        ? Object.fromEntries(
            Object.entries(raw.lastInsightByProcess).filter(
              (entry): entry is [string, string] => typeof entry[1] === 'string',
            ),
          )
        : {},
  };
}

export function LivingMemoryProvider({ children }: React.PropsWithChildren) {
  const [memory, setMemory] = useState<StoredMemory>(initialMemory);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setMemory(sanitize(JSON.parse(stored)));
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const update = useCallback((recipe: (current: StoredMemory) => StoredMemory) => {
    setMemory((current) => {
      const next = recipe(current);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const toggleFollow = useCallback(
    (processId: string) => {
      update((current) => ({
        ...current,
        followedProcessIds: current.followedProcessIds.includes(processId)
          ? current.followedProcessIds.filter((id) => id !== processId)
          : [processId, ...current.followedProcessIds],
      }));
    },
    [update],
  );

  const rememberProcess = useCallback(
    (processId: string) => update((current) => ({ ...current, lastProcessId: processId })),
    [update],
  );

  const rememberInsight = useCallback(
    (processId: string, insightId: string) =>
      update((current) => ({
        ...current,
        lastProcessId: processId,
        lastInsightByProcess: { ...current.lastInsightByProcess, [processId]: insightId },
      })),
    [update],
  );

  const value = useMemo<LivingMemoryValue>(
    () => ({
      ...memory,
      hydrated,
      isFollowing: (processId) => memory.followedProcessIds.includes(processId),
      toggleFollow,
      rememberProcess,
      rememberInsight,
    }),
    [hydrated, memory, rememberInsight, rememberProcess, toggleFollow],
  );

  return <LivingMemoryContext.Provider value={value}>{children}</LivingMemoryContext.Provider>;
}

export function useLivingMemory(): LivingMemoryValue {
  const value = useContext(LivingMemoryContext);
  if (!value) throw new Error('useLivingMemory must be used inside LivingMemoryProvider.');
  return value;
}
