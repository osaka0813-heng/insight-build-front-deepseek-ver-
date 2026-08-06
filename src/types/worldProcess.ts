import type { ConfidenceLevel, LanguageCode } from './insight';

export type ProcessStatus = 'emerging' | 'accelerating' | 'maturing' | 'uncertain';

export type EvolutionStage =
  | 'signal'
  | 'emerging'
  | 'accelerating'
  | 'structural'
  | 'maturing'
  | 'uncertain'
  | 'declining';

export type EvolutionImpact = 'supports' | 'updates' | 'challenges';

export type ProcessChangeType =
  | 'new_evidence'
  | 'acceleration'
  | 'scope_expansion'
  | 'stage_transition'
  | 'contradiction'
  | 'thesis_revision';

export type ProcessActor = {
  id: string;
  name: string;
  role?: string;
};

export type ProcessFoundation = {
  currentStage?: EvolutionStage;
  stageChangedAt?: string;
  confidenceScore?: number;
  supportingInsightIds?: string[];
  contradictingInsightIds?: string[];
  keyActors?: ProcessActor[];
  domains?: string[];
  nextSignals?: string[];
};

export type ProcessRelationship =
  | 'depends_on'
  | 'enables'
  | 'supplies'
  | 'constrains'
  | 'competes_for'
  | 'shaped_by'
  | 'reinforces'
  | 'related';

export type ProcessConnection = {
  processId: string;
  relationship: ProcessRelationship;
  weight?: number;
};

export type EvolutionEventContent = {
  title: string;
  description: string;
  implication: string;
};

export type LocalizedEvolutionEvent = {
  id: string;
  date: string;
  stage: EvolutionStage;
  impact: EvolutionImpact;
  insightId?: string;
  changeType?: ProcessChangeType;
  confidenceDelta?: number;
  previousStage?: EvolutionStage;
  evidenceIds?: string[];
  content: Partial<Record<LanguageCode, EvolutionEventContent>> & {
    en: EvolutionEventContent;
  };
};

export type EvolutionEvent = Omit<LocalizedEvolutionEvent, 'content'> &
  EvolutionEventContent & {
    language: LanguageCode;
    requestedLanguage: LanguageCode;
    usedFallback: boolean;
    dateDisplay: string;
  };

export type WorldProcessContent = {
  title: string;
  summary: string;
  thesis: string;
  nextQuestion: string;
  domains: string[];
  storyLabel: string;
  currentStageLabel: string;
  stageSummary: string;
  observeNext: string[];
};

export type LocalizedWorldProcess = ProcessFoundation & {
  id: string;
  slug: string;
  status: ProcessStatus;
  confidence: ConfidenceLevel;
  startedAt: string;
  updatedAt: string;
  insightIds: string[];
  tags: string[];
  connections?: ProcessConnection[];
  evolution: LocalizedEvolutionEvent[];
  content: Partial<Record<LanguageCode, WorldProcessContent>> & {
    en: WorldProcessContent;
  };
};

export type WorldProcess = Omit<LocalizedWorldProcess, 'content' | 'evolution'> &
  WorldProcessContent & {
    evolution: EvolutionEvent[];
    latestEvolution?: EvolutionEvent;
    supportingInsightIds: string[];
    contradictingInsightIds: string[];
    keyActors: ProcessActor[];
    confidenceScore?: number;
    stageChangedAt?: string;
    language: LanguageCode;
    requestedLanguage: LanguageCode;
    usedFallback: boolean;
    startedDisplay: string;
    updatedDisplay: string;
    currentStage: EvolutionStage;
  };

export type RelatedProcessRecommendation = {
  process: WorldProcess;
  relationship: string;
  relationshipType: ProcessRelationship;
  score: number;
  why: string;
  sharedTags: string[];
  isEditoriallyConfirmed: boolean;
};
