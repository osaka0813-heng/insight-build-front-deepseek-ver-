import type { DailyInsightState, LocalizedDailyState } from './dailyState';
import type { LocalizedInsightEdition } from './insight';
import type { EvolutionStage, LocalizedEvolutionEvent } from './worldProcess';

export type WriterDraftStatus = 'draft' | 'approved' | 'rejected';

export type WriterQualityChecks = {
  publishThresholdMet: boolean;
  sourceUrlsPreserved: boolean;
  noMarkdownLinksInCopy: boolean;
  languagesComplete: boolean;
  warnings: string[];
};

export type WriterProcessUpdate = {
  processId: string;
  updatedAt: string;
  appendInsightId: string;
  evolutionEvent: LocalizedEvolutionEvent;
  nextQuestion: { en: string; zh: string; ja: string };
  observeNext: { en: string[]; zh: string[]; ja: string[] };
};

export type WriterDraftBundle = {
  id: string;
  status: WriterDraftStatus;
  writtenAt: string;
  researchDraftId: string;
  candidateId: string;
  model: string;
  dailyState: DailyInsightState;
  matchedProcessId?: string;
  qualityChecks: WriterQualityChecks;
  insight: LocalizedInsightEdition;
  dailyStateDraft: LocalizedDailyState;
  processUpdate?: WriterProcessUpdate;
  approvedAt?: string;
  rejectedAt?: string;
};
