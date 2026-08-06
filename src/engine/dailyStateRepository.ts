import { getRuntimeContentBundle } from './runtimeContentStore';
import { evaluateDailyDecision } from './dailyDecisionEngine';
import type { LanguageCode } from '../types/insight';
import type { DailyState, LocalizedDailyState } from '../types/dailyState';

function localize(entry: LocalizedDailyState, language: LanguageCode): DailyState {
  const localized = entry.content[language] ?? entry.content.en;
  const decision = evaluateDailyDecision(
    { date: entry.date, processId: entry.processId, candidateSignalIds: entry.candidateSignalIds ?? [] },
    getRuntimeContentBundle().dailyCandidates,
  );
  const candidates = getRuntimeContentBundle().dailyCandidates
    .filter((candidate) => (entry.candidateSignalIds ?? []).includes(candidate.id))
    .map((candidate) => {
      const content = candidate.content[language] ?? candidate.content.en;
      return { id: candidate.id, title: content.title, summary: content.summary };
    });

  return {
    ...entry,
    ...localized,
    state: decision.state,
    materialChangeScore: decision.materialChangeScore,
    evidenceStrength: decision.evidenceStrength,
    noveltyScore: decision.noveltyScore,
    importanceScore: decision.importanceScore,
    decision,
    decisionMode: 'rule_engine',
    language: entry.content[language] ? language : 'en',
    requestedLanguage: language,
    usedFallback: !entry.content[language],
    candidates,
  };
}

export const dailyStateRepository = {
  getCurrent(language: LanguageCode): DailyState {
    const latest = [...getRuntimeContentBundle().dailyStates].sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())[0];
    return localize(latest, language);
  },
  getByInsightId(insightId: string, language: LanguageCode): DailyState | undefined {
    const entry = getRuntimeContentBundle().dailyStates.find((item) => item.insightId === insightId);
    return entry ? localize(entry, language) : undefined;
  },
  getByDate(date: string, language: LanguageCode): DailyState | undefined {
    const entry = getRuntimeContentBundle().dailyStates.find((item) => item.date === date);
    return entry ? localize(entry, language) : undefined;
  },
  list(language: LanguageCode): DailyState[] {
    return [...getRuntimeContentBundle().dailyStates]
      .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
      .map((item) => localize(item, language));
  },
};
