import type { DailyCandidateSignal, DailyDecisionInput, DailyDecisionResult } from '../types/dailyDecision';

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function evaluateDailyDecision(
  input: DailyDecisionInput,
  candidates: DailyCandidateSignal[],
): DailyDecisionResult {
  const selected = candidates.filter((candidate) => input.candidateSignalIds.includes(candidate.id));
  const matchedProcess = Boolean(input.processId) && selected.some((candidate) => candidate.processId === input.processId);

  const importanceScore = round(average(selected.map((item) => item.importance)));
  const noveltyScore = round(average(selected.map((item) => item.novelty)));
  const sourceBonus = Math.min(8, average(selected.map((item) => Math.max(0, item.independentSourceCount - 1) * 3)));
  const evidenceStrength = round(average(selected.map((item) => item.evidenceStrength)) + sourceBonus);
  const materialChangeScore = round(
    average(selected.map((item) => item.thesisImpact)) * 0.55 +
    average(selected.map((item) => item.relationshipChange)) * 0.25 +
    average(selected.map((item) => item.stageChange)) * 0.20,
  );
  const relationshipChange = average(selected.map((item) => item.relationshipChange));
  const stageChange = average(selected.map((item) => item.stageChange));
  const contradiction = average(selected.map((item) => item.contradiction));

  let state: DailyDecisionResult['state'] = 'no_new_global_insight';
  const reasonCodes: DailyDecisionResult['reasonCodes'] = [];

  if (!matchedProcess && importanceScore >= 80 && noveltyScore >= 78 && evidenceStrength >= 78 && materialChangeScore >= 75) {
    state = 'publish_new';
    reasonCodes.push('new_system_relationship');
  } else if (
    matchedProcess && evidenceStrength >= 72 && materialChangeScore >= 65 &&
    (relationshipChange >= 65 || stageChange >= 65 || contradiction >= 55)
  ) {
    state = 'update_living';
    reasonCodes.push('existing_process_updated');
    if (stageChange >= 65) reasonCodes.push('stage_transition');
    if (contradiction >= 55) reasonCodes.push('thesis_challenged');
  } else {
    if (evidenceStrength < 72) reasonCodes.push('insufficient_evidence');
    if (materialChangeScore < 65) reasonCodes.push('insufficient_material_change');
    if (evidenceStrength >= 72 && materialChangeScore < 65) reasonCodes.push('support_only');
  }

  const decisiveSignalIds = [...selected]
    .sort((a, b) => (b.thesisImpact + b.relationshipChange + b.stageChange) - (a.thesisImpact + a.relationshipChange + a.stageChange))
    .slice(0, 3)
    .map((item) => item.id);

  return { state, importanceScore, noveltyScore, evidenceStrength, materialChangeScore, matchedProcess, decisiveSignalIds, reasonCodes };
}
