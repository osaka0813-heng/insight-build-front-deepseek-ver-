import { getRuntimeContentBundle } from './runtimeContentStore';
import { analyzeResearchCandidate } from './researchAnalyst';
import type { ResearchDraftBundle } from '../types/research';

export const researchDraftRepository = {
  getAll(): ResearchDraftBundle[] {
    const bundle = getRuntimeContentBundle();
    return [...(bundle.researchDrafts ?? [])]
      .map((draft) => ({
        ...draft,
        candidates: draft.candidates.map((candidate) =>
          analyzeResearchCandidate(candidate, draft.researchDate, bundle.worldProcesses),
        ),
      }))
      .sort((a, b) => new Date(b.researchedAt).getTime() - new Date(a.researchedAt).getTime());
  },
  getDraftCount(): number {
    return (getRuntimeContentBundle().researchDrafts ?? [])
      .filter((item) => item.status === 'draft').length;
  },
};
