import { getRuntimeContentBundle } from './runtimeContentStore';
import type { LanguageCode } from '../types/insight';
import type {
  LocalizedWorldProcess,
  ProcessRelationship,
  EvolutionEvent,
  LocalizedEvolutionEvent,
  RelatedProcessRecommendation,
  WorldProcess,
} from '../types/worldProcess';

function processes(): LocalizedWorldProcess[] {
  return getRuntimeContentBundle().worldProcesses;
}

function processById(id: string): LocalizedWorldProcess | undefined {
  return processes().find((process) => process.id === id);
}

const relationshipLabels: Record<LanguageCode, Record<ProcessRelationship, string>> = {
  en: {
    depends_on: 'DEPENDS ON', enables: 'ENABLES', supplies: 'SUPPLIES', constrains: 'CONSTRAINS',
    competes_for: 'COMPETES FOR', shaped_by: 'SHAPED BY', reinforces: 'REINFORCES', related: 'RELATED',
  },
  zh: {
    depends_on: '依赖于', enables: '支撑', supplies: '提供供给', constrains: '形成约束',
    competes_for: '争夺同一资源', shaped_by: '受到塑造', reinforces: '相互强化', related: '存在关联',
  },
  ja: {
    depends_on: '依存する', enables: '支える', supplies: '供給する', constrains: '制約する',
    competes_for: '同じ資源を競う', shaped_by: '影響を受ける', reinforces: '相互に強める', related: '関連する',
  },
};

const tagLabels: Record<LanguageCode, Record<string, string>> = {
  en: {},
  zh: {
    ai: 'AI', compute: '算力', datacenter: '数据中心', electricity: '电力', grid: '电网',
    semiconductor: '半导体', capital: '资本', land: '土地', energy: '能源', industry: '工业',
    nuclear: '核能', geopolitics: '地缘政治', manufacturing: '制造业', 'supply-chain': '供应链',
    policy: '政策', 'export-control': '出口管制', security: '安全',
  },
  ja: {
    ai: 'AI', compute: '計算資源', datacenter: 'データセンター', electricity: '電力', grid: '送電網',
    semiconductor: '半導体', capital: '資本', land: '土地', energy: 'エネルギー', industry: '産業',
    nuclear: '原子力', geopolitics: '地政学', manufacturing: '製造', 'supply-chain': '供給網',
    policy: '政策', 'export-control': '輸出規制', security: '安全保障',
  },
};

function formatDate(iso: string, language: LanguageCode): string {
  const locale = language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Tokyo',
  }).format(new Date(iso)).toUpperCase();
}


function resolveEvolutionEvent(
  raw: LocalizedEvolutionEvent,
  requestedLanguage: LanguageCode,
): EvolutionEvent {
  const localized = raw.content[requestedLanguage];
  const content = localized ?? raw.content.en;
  const usedLanguage = localized ? requestedLanguage : 'en';
  return {
    id: raw.id,
    date: raw.date,
    stage: raw.stage,
    impact: raw.impact,
    insightId: raw.insightId,
    changeType: raw.changeType,
    confidenceDelta: raw.confidenceDelta,
    previousStage: raw.previousStage,
    evidenceIds: raw.evidenceIds,
    ...content,
    language: usedLanguage,
    requestedLanguage,
    usedFallback: !localized,
    dateDisplay: formatDate(raw.date, requestedLanguage),
  };
}

function resolve(raw: LocalizedWorldProcess, requestedLanguage: LanguageCode): WorldProcess {
  const localized = raw.content[requestedLanguage];
  const content = localized ?? raw.content.en;
  const usedLanguage = localized ? requestedLanguage : 'en';
  const evolution = raw.evolution
    .map((item) => resolveEvolutionEvent(item, requestedLanguage))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestEvolution = evolution[evolution.length - 1];

  return {
    id: raw.id, slug: raw.slug, status: raw.status, confidence: raw.confidence,
    startedAt: raw.startedAt, updatedAt: raw.updatedAt, insightIds: raw.insightIds,
    tags: raw.tags, connections: raw.connections, ...content,
    evolution,
    latestEvolution,
    currentStage: raw.currentStage ?? latestEvolution?.stage ?? raw.status,
    stageChangedAt: raw.stageChangedAt,
    confidenceScore: raw.confidenceScore,
    supportingInsightIds: raw.supportingInsightIds ?? raw.insightIds,
    contradictingInsightIds: raw.contradictingInsightIds ?? [],
    keyActors: raw.keyActors ?? [],
    language: usedLanguage, requestedLanguage, usedFallback: !localized,
    startedDisplay: formatDate(raw.startedAt, requestedLanguage),
    updatedDisplay: formatDate(raw.updatedAt, requestedLanguage),
  };
}

function intersection(a: string[], b: string[]): string[] {
  const right = new Set(b);
  return a.filter((tag) => right.has(tag));
}

function editorialConnection(source: LocalizedWorldProcess, targetId: string) {
  return source.connections?.find((connection) => connection.processId === targetId);
}

function inferRelationship(source: LocalizedWorldProcess, target: LocalizedWorldProcess): ProcessRelationship {
  const explicit = editorialConnection(source, target.id);
  if (explicit) return explicit.relationship;
  const shared = new Set(intersection(source.tags, target.tags));
  if (shared.has('electricity') || shared.has('grid') || shared.has('energy')) return 'depends_on';
  if (shared.has('semiconductor') || shared.has('compute')) return 'supplies';
  if (shared.has('geopolitics') || shared.has('policy') || shared.has('export-control')) return 'shaped_by';
  if (shared.has('capital') || shared.has('land')) return 'competes_for';
  return 'related';
}

function scoreConnection(source: LocalizedWorldProcess, target: LocalizedWorldProcess): number {
  const sharedTags = intersection(source.tags, target.tags);
  const explicit = editorialConnection(source, target.id);
  const reverse = editorialConnection(target, source.id);
  const sharedScore = Math.min(52, sharedTags.length * 13);
  const editorialScore = explicit ? 24 + (explicit.weight ?? 0) : reverse ? 14 + (reverse.weight ?? 0) / 2 : 0;
  const crossDomainBonus = sharedTags.length >= 2 && source.content.en.domains[0] !== target.content.en.domains[0] ? 8 : 0;
  const recencyBonus = Math.max(0, 6 - Math.floor(Math.abs(new Date(source.updatedAt).getTime() - new Date(target.updatedAt).getTime()) / 86_400_000));
  return Math.min(99, Math.round(18 + sharedScore + editorialScore + crossDomainBonus + recencyBonus));
}

function displayTag(tag: string, language: LanguageCode): string {
  return tagLabels[language][tag] ?? tag.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildWhy(
  source: LocalizedWorldProcess,
  target: LocalizedWorldProcess,
  sharedTags: string[],
  relationship: ProcessRelationship,
  language: LanguageCode,
): string {
  const concepts = sharedTags.slice(0, 3).map((tag) => displayTag(tag, language));
  const joined = language === 'en' ? concepts.join(', ') : concepts.join('、');
  const sourceTitle = source.content[language]?.title ?? source.content.en.title;
  const targetTitle = target.content[language]?.title ?? target.content.en.title;

  if (language === 'zh') {
    return concepts.length
      ? `${sourceTitle}与${targetTitle}通过${joined}相连；这意味着一个进程的变化，可能直接改变另一个进程的速度、成本或可行性。`
      : `${sourceTitle}与${targetTitle}存在编辑确认的结构关系，值得作为同一系统持续观察。`;
  }
  if (language === 'ja') {
    return concepts.length
      ? `${sourceTitle}と${targetTitle}は${joined}でつながる。一方の変化が、もう一方の速度・コスト・実現可能性を直接変える可能性がある。`
      : `${sourceTitle}と${targetTitle}には編集上確認された構造的関係があり、同じシステムとして継続観察する価値がある。`;
  }
  const relation = relationshipLabels.en[relationship].toLowerCase();
  return concepts.length
    ? `${sourceTitle} ${relation} ${targetTitle} through ${joined}. A change in one process can alter the speed, cost or feasibility of the other.`
    : `${sourceTitle} and ${targetTitle} have an editorially confirmed structural relationship worth monitoring as one system.`;
}

function recommendations(processId: string, language: LanguageCode, limit = 4): RelatedProcessRecommendation[] {
  const source = processById(processId);
  if (!source) return [];
  return processes()
    .filter((candidate) => candidate.id !== processId)
    .map((target) => {
      const sharedTags = intersection(source.tags, target.tags);
      const explicit = editorialConnection(source, target.id);
      const reverse = editorialConnection(target, source.id);
      const relationshipType = inferRelationship(source, target);
      return {
        process: resolve(target, language),
        relationship: relationshipLabels[language][relationshipType],
        relationshipType,
        score: scoreConnection(source, target),
        why: buildWhy(source, target, sharedTags, relationshipType, language),
        sharedTags: sharedTags.map((tag) => displayTag(tag, language)),
        isEditoriallyConfirmed: Boolean(explicit || reverse),
      };
    })
    .filter((item) => item.score >= 42)
    .sort((a, b) => b.score - a.score || b.process.updatedAt.localeCompare(a.process.updatedAt))
    .slice(0, limit);
}

export const worldProcessRepository = {
  getById(id: string, language: LanguageCode): WorldProcess | undefined {
    const process = processById(id);
    return process ? resolve(process, language) : undefined;
  },
  getForInsight(insightId: string, language: LanguageCode): WorldProcess | undefined {
    const process = processes().find((candidate) => candidate.insightIds.includes(insightId));
    return process ? resolve(process, language) : undefined;
  },
  /** Backwards-compatible name; now powered by automatic scoring. */
  getConnected(processId: string, language: LanguageCode): RelatedProcessRecommendation[] {
    return recommendations(processId, language);
  },
  getRelated(processId: string, language: LanguageCode, limit = 4): RelatedProcessRecommendation[] {
    return recommendations(processId, language, limit);
  },
  getEvolution(processId: string, language: LanguageCode): EvolutionEvent[] {
    return this.getById(processId, language)?.evolution ?? [];
  },
  getLatestEvolution(processId: string, language: LanguageCode): EvolutionEvent | undefined {
    const events = this.getEvolution(processId, language);
    return events[events.length - 1];
  },
  getAll(language: LanguageCode): WorldProcess[] {
    return processes().map((process) => resolve(process, language)).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },
};
