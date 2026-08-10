import { insightRepository } from './insightRepository';
import type { DailyContinuity } from '../types/dailyContinuity';
import type { DailyState } from '../types/dailyState';
import type { LanguageCode } from '../types/insight';

const copy = {
  en: {
    publish_new: ['A new world-level relationship has appeared.', 'The current evidence is strong enough to begin a new line of understanding.'],
    update_living: ['The process has moved since your last reading.', 'New evidence changes how the existing World Process should be understood.'],
    no_new_global_insight: ['The current judgment remains unchanged.', 'New signals were recorded, but they do not yet change the thesis, system relationship or process stage.'],
  },
  zh: {
    publish_new: ['出现了一条新的世界级关系。', '当前证据已经足以开启一条新的长期认知线索。'],
    update_living: ['从你上次阅读后，这条进程已经向前推进。', '新增证据改变了我们理解既有世界进程的方式。'],
    no_new_global_insight: ['当前判断维持不变。', '系统记录了新的信号，但它们暂时没有改变命题、系统关系或进程阶段。'],
  },
  ja: {
    publish_new: ['新しい世界レベルの関係が現れた。', '現在の証拠は、新しい長期的な理解を始める水準に達した。'],
    update_living: ['前回の読了後、このプロセスは前進した。', '新しい証拠により、既存の世界プロセスの理解が更新された。'],
    no_new_global_insight: ['現在の判断は維持される。', '新しいシグナルは記録されたが、命題・システム関係・段階はまだ変わっていない。'],
  },
} as const;

export const dailyContinuityRepository = {
  build(dailyState: DailyState, language: LanguageCode, lastSeenInsightId?: string): DailyContinuity {
    const preferredLanguage = language === 'zh' || language === 'ja' ? language : 'en';
    const stateCopy = copy[preferredLanguage][dailyState.state];
    const fallbackLastSeenId = dailyState.previousInsightId;
    const effectiveLastSeenId = lastSeenInsightId && lastSeenInsightId !== dailyState.insightId
      ? lastSeenInsightId
      : fallbackLastSeenId;
    const lastSeen = effectiveLastSeenId
      ? insightRepository.getById(effectiveLastSeenId, language)
      : fallbackLastSeenId
        ? insightRepository.getById(fallbackLastSeenId, language)
        : undefined;

    return {
      state: dailyState.state,
      lastSeenTitle: lastSeen?.cover.title,
      lastSeenDate: lastSeen?.dateDisplay,
      additions: dailyState.candidates,
      judgmentTitle: stateCopy[0],
      judgmentSummary: stateCopy[1],
      changedSinceLastVisit: dailyState.state !== 'no_new_global_insight',
    };
  },
};
