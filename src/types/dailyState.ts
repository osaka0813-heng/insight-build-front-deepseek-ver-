import type { LanguageCode } from './insight';
import type { DailyDecisionResult } from './dailyDecision';

export type DailyInsightState =
  | 'publish_new'
  | 'update_living'
  | 'no_new_global_insight';

export type DailyStateCopy = {
  label: string;
  decisionTitle: string;
  decisionSummary: string;
  thresholdReason: string;
  observeNext?: string[];
};

export type LocalizedDailyState = {
  id: string;
  date: string;
  decidedAt: string;
  state: DailyInsightState;
  insightId?: string;
  processId?: string;
  previousInsightId?: string;
  materialChangeScore: number;
  evidenceStrength: number;
  noveltyScore: number;
  importanceScore: number;
  candidateSignalIds?: string[];
  content: Partial<Record<LanguageCode, DailyStateCopy>> & { en: DailyStateCopy };
};

export type DailyCandidateSummary = {
  id: string;
  title: string;
  summary: string;
};

export type DailyState = Omit<LocalizedDailyState, 'content'> &
  DailyStateCopy & {
    language: LanguageCode;
    requestedLanguage: LanguageCode;
    usedFallback: boolean;
    decision: DailyDecisionResult;
    decisionMode: 'rule_engine';
    candidates: DailyCandidateSummary[];
  };
