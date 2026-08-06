import { getRuntimeContentBundle } from './runtimeContentStore';
import type { WriterDraftBundle } from '../types/writer';

export const writerDraftRepository = {
  getAll(): WriterDraftBundle[] {
    return [...(getRuntimeContentBundle().writerDrafts ?? [])]
      .sort((a, b) => Date.parse(b.writtenAt) - Date.parse(a.writtenAt));
  },
  getById(id: string): WriterDraftBundle | undefined {
    return getRuntimeContentBundle().writerDrafts?.find((draft) => draft.id === id);
  },
};
