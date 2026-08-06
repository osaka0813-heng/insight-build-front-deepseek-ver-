export type LanguageCode = 'en' | 'zh' | 'ja';
export type ConfidenceLevel = 'verified' | 'developing' | 'hypothesis';
export type InsightStatus = 'publish_new' | 'update_living' | 'no_new';
export type SourceType = 'official' | 'research' | 'government' | 'filing' | 'media' | 'community';
export type ReliabilityLevel = 'primary' | 'strong' | 'context';

export type Source = {
  id: string;
  title: string;
  publisher: string;
  publishedAt?: string;
  url: string;
  type: SourceType;
  reliability: ReliabilityLevel;
  note?: string;
};

export type Evidence = {
  id: string;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  sourceIds: string[];
};

export type Signal = {
  id: string;
  label: string;
  title: string;
  body: string;
  whyImportant?: string;
  evidence?: Evidence[];
  sources?: Source[];
};

export type ObserveItem = { label: string; prompt: string; meta: string };
export type InsightContent = {
  cover: { eyebrow: string; secondaryEyebrow?: string; title: string; summary: string };
  question: { lead: string; title: string; footnote: string };
  signals: { title: string; items: Signal[]; sourceNote: string };
  pattern: { title: string; before: string; shift: string; now: string; conclusion: string };
  insight: { title: string; formula: string; explanation: string };
  observe: { title: string; items: ObserveItem[]; ending: string };
};
export type LocalizedInsightEdition = {
  id: string; slug: string; status: InsightStatus; parentInsightId?: string; processId?: string;
  publishedAt: string; updatedAt: string; confidence: ConfidenceLevel;
  content: Partial<Record<LanguageCode, InsightContent>> & { en: InsightContent };
};
export type InsightEdition = Omit<LocalizedInsightEdition, 'content'> & InsightContent & {
  language: LanguageCode; requestedLanguage: LanguageCode; usedFallback: boolean; dateDisplay: string;
};
export type InsightArchiveEntry = Pick<InsightEdition,
  'id'|'slug'|'dateDisplay'|'publishedAt'|'updatedAt'|'confidence'|'status'|'language'|'usedFallback'
> & {
  title: string;
  summary: string;
  processId?: string;
  processTitle?: string;
  processChapter?: number;
  processChapterCount?: number;
};
