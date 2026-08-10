import type { DailyCandidateSignal } from './dailyDecision';
import type { LocalizedDailyState } from './dailyState';
import type { LocalizedInsightEdition } from './insight';
import type { LocalizedWorldProcess } from './worldProcess';
import type { ResearchDraftBundle } from './research';
import type { WriterDraftBundle } from './writer';

export const REMOTE_CONTENT_SCHEMA_VERSION = 1;

export type RemoteContentBundle = {
  schemaVersion: number;
  generatedAt: string;
  contentVersion: string;
  insights: LocalizedInsightEdition[];
  worldProcesses: LocalizedWorldProcess[];
  dailyStates: LocalizedDailyState[];
  dailyCandidates: DailyCandidateSignal[];
  researchDrafts?: ResearchDraftBundle[];
  writerDrafts?: WriterDraftBundle[];
};

export type RemoteContentSource = 'local' | 'cache' | 'remote';
export type RemoteContentPhase = 'booting' | 'ready' | 'refreshing';

export type RemoteContentStatus = {
  phase: RemoteContentPhase;
  source: RemoteContentSource;
  contentVersion: string;
  generatedAt?: string;
  lastCheckedAt?: string;
  lastSuccessfulSyncAt?: string;
  error?: string;
};
