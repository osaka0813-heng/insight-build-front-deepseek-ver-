import { getRuntimeContentBundle } from './runtimeContentStore';
import { worldProcessRepository } from './worldProcessRepository';
import type {
  InsightArchiveEntry,
  InsightEdition,
  LanguageCode,
  LocalizedInsightEdition,
} from '../types/insight';


const PLACEHOLDER_TEXTS = new Set([
  '无字段',
  '沒有欄位',
  '没有字段',
  '未填写',
  '未填寫',
  '待补充',
  '待補充',
  '暂无内容',
  '暫無內容',
  'no field',
  'no fields',
  'missing field',
  'not available',
  'n/a',
  '未入力',
  '項目なし',
  'フィールドなし',
]);

function isMeaningfulText(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && !PLACEHOLDER_TEXTS.has(normalized);
}

function text(value: unknown, fallback: string): string {
  return isMeaningfulText(value)
    ? value
    : fallback;
}

function mergeInsightContent(
  raw: LocalizedInsightEdition,
  requestedLanguage: LanguageCode,
) {
  const english = raw.content.en;
  const localized = raw.content[requestedLanguage];
  const source = localized ?? english;

  const merged = {
    cover: {
      eyebrow: text(source?.cover?.eyebrow, english?.cover?.eyebrow || ''),
      secondaryEyebrow:
        source?.cover?.secondaryEyebrow ||
        english?.cover?.secondaryEyebrow,
      title: text(source?.cover?.title, english?.cover?.title || ''),
      summary: text(source?.cover?.summary, english?.cover?.summary || ''),
    },
    question: {
      lead: text(source?.question?.lead, english?.question?.lead || ''),
      title: text(source?.question?.title, english?.question?.title || ''),
      footnote: text(
        source?.question?.footnote,
        english?.question?.footnote || '',
      ),
    },
    signals: {
      title: text(source?.signals?.title, english?.signals?.title || ''),
      items:
        Array.isArray(source?.signals?.items) &&
        source.signals.items.length > 0
          ? source.signals.items
          : english?.signals?.items || [],
      sourceNote: text(
        source?.signals?.sourceNote,
        english?.signals?.sourceNote || '',
      ),
    },
    pattern: {
      title: text(source?.pattern?.title, english?.pattern?.title || ''),
      before: text(source?.pattern?.before, english?.pattern?.before || ''),
      shift: text(source?.pattern?.shift, english?.pattern?.shift || ''),
      now: text(source?.pattern?.now, english?.pattern?.now || ''),
      conclusion: text(
        source?.pattern?.conclusion,
        english?.pattern?.conclusion || '',
      ),
    },
    insight: {
      title: text(source?.insight?.title, english?.insight?.title || ''),
      formula: text(source?.insight?.formula, english?.insight?.formula || ''),
      explanation: text(
        source?.insight?.explanation,
        english?.insight?.explanation || '',
      ),
    },
    observe: {
      title: text(source?.observe?.title, english?.observe?.title || ''),
      items:
        Array.isArray(source?.observe?.items) &&
        source.observe.items.length > 0
          ? source.observe.items
          : english?.observe?.items || [],
      ending: text(source?.observe?.ending, english?.observe?.ending || ''),
    },
  };

  return {
    content: merged,
    usedLanguage: localized ? requestedLanguage : 'en',
    usedFallback:
      !localized ||
      JSON.stringify(merged) !== JSON.stringify(source),
  };
}

function isRenderableInsight(raw: LocalizedInsightEdition): boolean {
  const { content } = mergeInsightContent(raw, 'en');
  return Boolean(
    isMeaningfulText(content.cover.title) &&
      isMeaningfulText(content.cover.summary) &&
      isMeaningfulText(content.question.title) &&
      isMeaningfulText(content.signals.title) &&
      content.signals.items.length > 0 &&
      isMeaningfulText(content.pattern.title) &&
      isMeaningfulText(content.pattern.before) &&
      isMeaningfulText(content.pattern.shift) &&
      isMeaningfulText(content.pattern.now) &&
      isMeaningfulText(content.pattern.conclusion) &&
      isMeaningfulText(content.insight.title) &&
      isMeaningfulText(content.observe.title) &&
      content.observe.items.length > 0,
  );
}

function formatDate(iso: string, language: LanguageCode): string {
  const locale = language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(new Date(iso)).toUpperCase();
}

function resolve(raw: LocalizedInsightEdition, requestedLanguage: LanguageCode): InsightEdition {
  const resolved = mergeInsightContent(raw, requestedLanguage);
  return {
    id: raw.id,
    slug: raw.slug,
    status: raw.status,
    parentInsightId: raw.parentInsightId,
    processId: raw.processId,
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt,
    confidence: raw.confidence,
    ...resolved.content,
    language: resolved.usedLanguage,
    requestedLanguage,
    usedFallback: resolved.usedFallback,
    dateDisplay: formatDate(raw.publishedAt, requestedLanguage),
  };
}

function insights(): LocalizedInsightEdition[] {
  return getRuntimeContentBundle().insights;
}

export const insightRepository = {
  getCurrent(language: LanguageCode): InsightEdition {
    const current = [...insights()]
      .filter(isRenderableInsight)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      )[0];
    if (!current) throw new Error('Current Insight is missing.');
    return resolve(current, language);
  },
  getById(id: string, language: LanguageCode): InsightEdition | undefined {
    const insight = insights().find(
      (item) => item.id === id && isRenderableInsight(item),
    );
    return insight ? resolve(insight, language) : undefined;
  },
  getArchive(language: LanguageCode): InsightArchiveEntry[] {
    const resolved = insights()
      .filter(isRenderableInsight)
      .map((raw) => resolve(raw, language));

    return resolved
      .map((insight) => {
        const process = insight.processId
          ? worldProcessRepository.getById(insight.processId, language)
          : worldProcessRepository.getForInsight(insight.id, language);
        const processHistory = process
          ? resolved
              .filter((item) => {
                const linkedProcess = item.processId
                  ? worldProcessRepository.getById(item.processId, 'en')
                  : worldProcessRepository.getForInsight(item.id, 'en');
                return linkedProcess?.id === process.id;
              })
              .sort(
                (a, b) =>
                  new Date(a.publishedAt).getTime() -
                  new Date(b.publishedAt).getTime(),
              )
          : [];
        const processChapter = process
          ? processHistory.findIndex((item) => item.id === insight.id) + 1
          : undefined;

        return {
          id: insight.id,
          slug: insight.slug,
          title: insight.cover.title,
          summary: insight.cover.summary,
          dateDisplay: insight.dateDisplay,
          publishedAt: insight.publishedAt,
          updatedAt: insight.updatedAt,
          confidence: insight.confidence,
          status: insight.status,
          language: insight.language,
          usedFallback: insight.usedFallback,
          processId: process?.id,
          processTitle: process?.title,
          processChapter:
            processChapter && processChapter > 0
              ? processChapter
              : undefined,
          processChapterCount:
            processHistory.length > 0
              ? processHistory.length
              : undefined,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );
  },
  getForProcess(processId: string, language: LanguageCode): InsightEdition[] {
    const process = worldProcessRepository.getById(processId, language);
    if (!process) return [];

    const linkedIds = new Set([
      ...process.insightIds,
      ...process.supportingInsightIds,
      ...process.contradictingInsightIds,
      ...process.evolution
        .map((event) => event.insightId)
        .filter((id): id is string => Boolean(id)),
      ...insights()
        .filter((item) => item.processId === processId)
        .map((item) => item.id),
    ]);

    return [...linkedIds]
      .map((id) => this.getById(id, language))
      .filter((item): item is InsightEdition => Boolean(item))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );
  }
};
