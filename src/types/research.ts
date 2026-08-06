import type { DailyInsightState } from './dailyState';
import type { LanguageCode } from './insight';
import type { EvolutionImpact } from './worldProcess';

export type ResearchSourceKind = 'primary' | 'reliable_media' | 'context';
export type ResearchSourceRole = 'trigger' | 'corroborating' | 'context';
export type ResearchDraftStatus = 'draft' | 'approved' | 'rejected';
export type AnalystImpact = EvolutionImpact | 'no_material_change';

export type ResearchSource = {
  id?: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
  kind: ResearchSourceKind;
  role?: ResearchSourceRole;
};

export type ResearchCandidateCopy = {
  title: string;
  coreFact: string;
  whyItMatters: string;
  processMatchReason: string;
};

export type ResearchCandidateAnalysis = {
  matchedProcessId?: string;
  processMatchConfidence: number;
  impact: AnalystImpact;
  dailyState: DailyInsightState;
  materialChangeScore: number;
  publishThresholdMet: boolean;
  scoreWasNormalized: boolean;
  triggerSourceCount: number;
  corroboratingSourceCount: number;
  contextSourceCount: number;
  rationale: string;
  warnings: string[];
};

export type ResearchCandidateSignal = {
  id: string;
  date: string;
  domain: string;
  tags: string[];
  suggestedProcessId?: string;
  processMatchConfidence: number;
  importance: number;
  novelty: number;
  evidenceStrength: number;
  independentSourceCount: number;
  currentEventSourceCount?: number;
  corroboratingSourceCount?: number;
  contextSourceCount?: number;
  thesisImpact: number;
  relationshipChange: number;
  stageChange: number;
  contradiction: number;
  claimSourceIds?: string[];
  content: Partial<Record<LanguageCode, ResearchCandidateCopy>> & { en: ResearchCandidateCopy };
  sources: ResearchSource[];
  analysis?: ResearchCandidateAnalysis;
};

export type ResearchDraftBundle = {
  id: string;
  status: ResearchDraftStatus;
  researchedAt: string;
  researchDate: string;
  model: string;
  querySummary: string;
  candidates: ResearchCandidateSignal[];
};
