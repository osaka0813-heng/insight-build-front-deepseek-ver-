import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  EDITORIAL_ADMIN_SESSION_KEY,
  EDITORIAL_LOG_STORAGE_KEY,
  EDITORIAL_PIPELINE_STORAGE_KEY,
  EDITORIAL_PUBLISH_TOKEN_KEY,
  EDITORIAL_RESEARCH_TOKEN_KEY,
  LEGACY_EDITORIAL_TOKEN_STORAGE_KEY,
} from '../config/editorial';
import type { AdminSession } from './adminClient';
import type { ResearchDraftBundle } from '../types/research';
import type { WriterDraftBundle } from '../types/writer';

export type EditorialTokens = {
  researchToken: string;
  publishToken: string;
};

export type PipelineSnapshot = {
  savedAt: string;
  date: string;
  focus: string;
  researchDraft?: ResearchDraftBundle;
  analyzedDraft?: ResearchDraftBundle;
  writerDraft?: WriterDraftBundle;
};

export type EditorialLogEntry = {
  id: string;
  createdAt: string;
  stage: 'research' | 'analyze' | 'write' | 'publish' | 'sync' | 'admin';
  level: 'info' | 'error';
  message: string;
  status?: number;
  contentVersion?: string;
  insightId?: string;
};

export async function loadEditorialTokens(): Promise<EditorialTokens> {
  const [researchToken, publishToken] = await Promise.all([
    SecureStore.getItemAsync(EDITORIAL_RESEARCH_TOKEN_KEY),
    SecureStore.getItemAsync(EDITORIAL_PUBLISH_TOKEN_KEY),
  ]);

  if (researchToken || publishToken) {
    return {
      researchToken: researchToken || '',
      publishToken: publishToken || '',
    };
  }

  const legacy = await AsyncStorage.getItem(
    LEGACY_EDITORIAL_TOKEN_STORAGE_KEY,
  );
  if (!legacy) return { researchToken: '', publishToken: '' };

  try {
    const parsed = JSON.parse(legacy);
    const migrated = {
      researchToken:
        typeof parsed.researchToken === 'string' ? parsed.researchToken : '',
      publishToken:
        typeof parsed.publishToken === 'string' ? parsed.publishToken : '',
    };
    await saveEditorialTokens(migrated);
    await AsyncStorage.removeItem(LEGACY_EDITORIAL_TOKEN_STORAGE_KEY);
    return migrated;
  } catch {
    await AsyncStorage.removeItem(LEGACY_EDITORIAL_TOKEN_STORAGE_KEY);
    return { researchToken: '', publishToken: '' };
  }
}

export async function saveEditorialTokens(
  tokens: EditorialTokens,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(
      EDITORIAL_RESEARCH_TOKEN_KEY,
      tokens.researchToken.trim(),
    ),
    SecureStore.setItemAsync(
      EDITORIAL_PUBLISH_TOKEN_KEY,
      tokens.publishToken.trim(),
    ),
  ]);
}

export async function clearEditorialTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(EDITORIAL_RESEARCH_TOKEN_KEY),
    SecureStore.deleteItemAsync(EDITORIAL_PUBLISH_TOKEN_KEY),
  ]);
}

export async function saveAdminSession(session: AdminSession): Promise<void> {
  await SecureStore.setItemAsync(
    EDITORIAL_ADMIN_SESSION_KEY,
    JSON.stringify(session),
  );
}

export async function loadAdminSession(): Promise<AdminSession | undefined> {
  const raw = await SecureStore.getItemAsync(EDITORIAL_ADMIN_SESSION_KEY);
  if (!raw) return undefined;
  try {
    const session = JSON.parse(raw) as AdminSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await SecureStore.deleteItemAsync(EDITORIAL_ADMIN_SESSION_KEY);
      return undefined;
    }
    return session;
  } catch {
    await SecureStore.deleteItemAsync(EDITORIAL_ADMIN_SESSION_KEY);
    return undefined;
  }
}

export async function clearAdminSession(): Promise<void> {
  await SecureStore.deleteItemAsync(EDITORIAL_ADMIN_SESSION_KEY);
}

export async function savePipelineSnapshot(
  snapshot: PipelineSnapshot,
): Promise<void> {
  await AsyncStorage.setItem(
    EDITORIAL_PIPELINE_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export async function loadPipelineSnapshot(): Promise<
  PipelineSnapshot | undefined
> {
  const raw = await AsyncStorage.getItem(EDITORIAL_PIPELINE_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as PipelineSnapshot;
  } catch {
    await AsyncStorage.removeItem(EDITORIAL_PIPELINE_STORAGE_KEY);
    return undefined;
  }
}

export async function clearPipelineSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(EDITORIAL_PIPELINE_STORAGE_KEY);
}

export async function loadEditorialLogs(): Promise<EditorialLogEntry[]> {
  const raw = await AsyncStorage.getItem(EDITORIAL_LOG_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendEditorialLog(
  entry: Omit<EditorialLogEntry, 'id' | 'createdAt'>,
): Promise<void> {
  const logs = await loadEditorialLogs();
  const next: EditorialLogEntry[] = [
    {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    },
    ...logs,
  ].slice(0, 30);
  await AsyncStorage.setItem(
    EDITORIAL_LOG_STORAGE_KEY,
    JSON.stringify(next),
  );
}

export async function clearEditorialLogs(): Promise<void> {
  await AsyncStorage.removeItem(EDITORIAL_LOG_STORAGE_KEY);
}
