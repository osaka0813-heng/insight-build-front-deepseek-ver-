import type { LanguageCode } from './insight';
import type { DailyInsightState } from './dailyState';

export type CandidateSignalCopy = {
  title: string;
  summary: string;
};

export type DailyCandidateSignal = {
  id: string;
  date: string;
  processId?: string;
  tags: string[];
  domain: string;
  importance: number;
  novelty: number;
  evidenceStrength: number;
  independentSourceCount: number;
  thesisImpact: number;
  relationshipChange: number;
  stageChange: number;
  contradiction: number;
  content: Partial<Record<LanguageCode, CandidateSignalCopy>> & { en: CandidateSignalCopy };
};

export type DailyDecisionInput = {
  date: string;
  processId?: string;
  candidateSignalIds: string[];
};

export type DailyDecisionResult = {
  state: DailyInsightState;
  importanceScore: number;
  noveltyScore: number;
  evidenceStrength: number;
  materialChangeScore: number;
  matchedProcess: boolean;
  decisiveSignalIds: string[];
  reasonCodes: Array<
    | 'new_system_relationship'
    | 'existing_process_updated'
    | 'stage_transition'
    | 'thesis_challenged'
    | 'support_only'
    | 'insufficient_evidence'
    | 'insufficient_material_change'
  >;
};
