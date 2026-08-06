import {
  ANALYZE_API_URL,
  EDITORIAL_REQUEST_TIMEOUT_MS,
  RESEARCH_API_URL,
  WRITE_API_URL,
} from '../config/editorial';
import type { ResearchDraftBundle } from '../types/research';
import type { WriterDraftBundle } from '../types/writer';

export type ResearchRequest = {
  date: string;
  focus: string;
  maxSignals: number;
};

export type AnalyzeResponse = {
  ok: true;
  analyzedAt: string;
  draft: ResearchDraftBundle;
};

export type WriteResponse = {
  ok: true;
  writerDraft: WriterDraftBundle;
};

export type EditorialRequestError = Error & {
  status?: number;
  payload?: any;
  code?: string;
};

async function postJson<T>(
  url: string,
  token: string,
  body: unknown,
  stage: 'research' | 'analyze' | 'write',
): Promise<T> {
  if (!token.trim()) throw new Error('Research token is required.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EDITORIAL_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-research-token': token.trim(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Service returned invalid JSON (${response.status}).`);
    }
    if (!response.ok || !payload?.ok) {
      const error = new Error(
        payload?.error || `${stage} request failed (${response.status}).`,
      ) as EditorialRequestError;
      error.status = response.status;
      error.payload = payload;
      error.code = payload?.code || `${stage.toUpperCase()}_${response.status}`;
      throw error;
    }
    return payload as T;
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      const timeoutError = new Error(
        `${stage} 请求超时。请检查网络或后端运行时间限制。`,
      ) as EditorialRequestError;
      timeoutError.code = `${stage.toUpperCase()}_TIMEOUT`;
      throw timeoutError;
    }
    if (error instanceof TypeError) {
      const networkError = new Error(
        `${stage} 无法连接后端，请检查网络与 Vercel 状态。`,
      ) as EditorialRequestError;
      networkError.code = `${stage.toUpperCase()}_NETWORK`;
      throw networkError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function runResearch(request: ResearchRequest, token: string) {
  return postJson<ResearchDraftBundle & { ok: true }>(RESEARCH_API_URL, token, request, 'research');
}

export function runAnalyze(draft: ResearchDraftBundle, token: string) {
  return postJson<AnalyzeResponse>(ANALYZE_API_URL, token, draft, 'analyze');
}

export function runWrite(draft: ResearchDraftBundle, token: string, force = false) {
  return postJson<WriteResponse>(
    WRITE_API_URL,
    token,
    {
      researchDraft: draft,
      force,
    },
    'write',
  );
}
