import type { DailyInsightState } from '../types/dailyState';
import type {
  AnalystImpact,
  ResearchCandidateAnalysis,
  ResearchCandidateSignal,
  ResearchSource,
  ResearchSourceRole,
} from '../types/research';
import type { LocalizedWorldProcess } from '../types/worldProcess';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function normalizeScore(value: number): { value: number; normalized: boolean } {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return { value: 0, normalized: false };
  if (numeric >= 0 && numeric <= 10) return { value: clamp(numeric * 10), normalized: true };
  return { value: clamp(numeric), normalized: false };
}

function tokenize(values: string[]): Set<string> {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/u))
      .map((value) => value.trim())
      .filter((value) => value.length >= 2),
  );
}

function processTokens(process: LocalizedWorldProcess): Set<string> {
  const content = Object.values(process.content).filter(Boolean);
  return tokenize([
    process.id,
    process.slug,
    ...process.tags,
    ...content.flatMap((copy) => copy ? [copy.title, copy.summary, copy.thesis, ...copy.domains] : []),
  ]);
}

function inferRole(source: ResearchSource, researchDate: string): ResearchSourceRole {
  if (source.role) return source.role;
  if (!source.publishedAt) return source.kind === 'context' ? 'context' : 'corroborating';
  const sourceTime = Date.parse(source.publishedAt);
  const researchTime = Date.parse(researchDate);
  if (Number.isNaN(sourceTime) || Number.isNaN(researchTime)) return 'corroborating';
  const days = Math.abs(researchTime - sourceTime) / 86_400_000;
  if (days <= 2 && source.kind !== 'context') return 'trigger';
  if (days <= 45 && source.kind !== 'context') return 'corroborating';
  return 'context';
}

function bestProcessMatch(candidate: ResearchCandidateSignal, processes: LocalizedWorldProcess[]) {
  const candidateTokens = tokenize([
    candidate.domain,
    ...candidate.tags,
    candidate.content.en.title,
    candidate.content.en.coreFact,
    candidate.content.en.whyItMatters,
  ]);

  let best: { id?: string; score: number } = { score: 0 };
  for (const process of processes) {
    const tokens = processTokens(process);
    let shared = 0;
    candidateTokens.forEach((token) => { if (tokens.has(token)) shared += 1; });
    const denominator = Math.max(5, Math.min(candidateTokens.size, tokens.size));
    const tagScore = clamp((shared / denominator) * 100);
    const editorialBonus = candidate.suggestedProcessId === process.id ? 24 : 0;
    const score = clamp(tagScore * 0.76 + editorialBonus);
    if (score > best.score) best = { id: process.id, score };
  }

  const supplied = normalizeScore(candidate.processMatchConfidence).value;
  if (candidate.suggestedProcessId && supplied > best.score) {
    return { id: candidate.suggestedProcessId, score: supplied };
  }
  return best;
}

function decideImpact(scores: Record<string, number>): AnalystImpact {
  if (scores.contradiction >= 65) return 'challenges';
  if (scores.thesisImpact >= 60 || scores.stageChange >= 65 || scores.relationshipChange >= 70) return 'updates';
  if (scores.evidenceStrength >= 65) return 'supports';
  return 'no_material_change';
}

function decideDailyState(args: {
  matchedProcessId?: string;
  matchConfidence: number;
  scores: Record<string, number>;
  triggerSourceCount: number;
  corroboratingSourceCount: number;
}): DailyInsightState {
  const { matchedProcessId, matchConfidence, scores, triggerSourceCount, corroboratingSourceCount } = args;
  const evidenceReady = scores.evidenceStrength >= 68 && triggerSourceCount >= 1 && (triggerSourceCount + corroboratingSourceCount) >= 2;
  const material = Math.max(scores.thesisImpact, scores.relationshipChange, scores.stageChange, scores.contradiction);

  if (!evidenceReady || material < 48) return 'no_new_global_insight';
  if (matchedProcessId && matchConfidence >= 52) return 'update_living';
  if (scores.novelty >= 78 && scores.importance >= 75 && scores.relationshipChange >= 65) return 'publish_new';
  return 'no_new_global_insight';
}

export function analyzeResearchCandidate(
  candidate: ResearchCandidateSignal,
  researchDate: string,
  processes: LocalizedWorldProcess[],
): ResearchCandidateSignal {
  const fields = ['importance', 'novelty', 'evidenceStrength', 'thesisImpact', 'relationshipChange', 'stageChange', 'contradiction'] as const;
  const scores: Record<string, number> = {};
  let scoreWasNormalized = false;
  fields.forEach((field) => {
    const normalized = normalizeScore(candidate[field]);
    scores[field] = normalized.value;
    scoreWasNormalized ||= normalized.normalized;
  });

  const sources = candidate.sources.map((source, index) => ({
    ...source,
    id: source.id || `${candidate.id}-source-${index + 1}`,
    role: inferRole(source, researchDate),
  }));
  const triggerSourceCount = sources.filter((source) => source.role === 'trigger').length;
  const corroboratingSourceCount = sources.filter((source) => source.role === 'corroborating').length;
  const contextSourceCount = sources.filter((source) => source.role === 'context').length;
  const processMatch = bestProcessMatch(candidate, processes);
  const impact = decideImpact(scores);
  const dailyState = decideDailyState({
    matchedProcessId: processMatch.id,
    matchConfidence: processMatch.score,
    scores,
    triggerSourceCount,
    corroboratingSourceCount,
  });
  const materialChangeScore = clamp(
    scores.thesisImpact * 0.35 +
    scores.relationshipChange * 0.25 +
    scores.stageChange * 0.2 +
    scores.contradiction * 0.2,
  );
  const warnings: string[] = [];
  if (scoreWasNormalized) warnings.push('Legacy 0–10 scores were normalized to 0–100.');
  if (triggerSourceCount === 0) warnings.push('No trigger source falls inside the research window.');
  if (triggerSourceCount + corroboratingSourceCount < 2) warnings.push('Fewer than two current or corroborating sources.');
  if (!processMatch.id) warnings.push('No existing World Process match was found.');

  const analysis: ResearchCandidateAnalysis = {
    matchedProcessId: processMatch.id,
    processMatchConfidence: processMatch.score,
    impact,
    dailyState,
    materialChangeScore,
    publishThresholdMet: dailyState !== 'no_new_global_insight',
    scoreWasNormalized,
    triggerSourceCount,
    corroboratingSourceCount,
    contextSourceCount,
    rationale:
      dailyState === 'update_living'
        ? `Matches ${processMatch.id} and materially ${impact === 'challenges' ? 'challenges' : 'updates'} the living thesis.`
        : dailyState === 'publish_new'
          ? 'Evidence and novelty support a new World Process candidate.'
          : 'Evidence may be worth tracking, but the publication threshold is not met.',
    warnings,
  };

  return {
    ...candidate,
    ...scores,
    suggestedProcessId: processMatch.id || candidate.suggestedProcessId,
    processMatchConfidence: processMatch.score,
    independentSourceCount: triggerSourceCount + corroboratingSourceCount,
    currentEventSourceCount: triggerSourceCount,
    corroboratingSourceCount,
    contextSourceCount,
    claimSourceIds: candidate.claimSourceIds?.length
      ? candidate.claimSourceIds
      : sources.filter((source) => source.role !== 'context').map((source) => source.id!),
    sources,
    analysis,
  };
}
