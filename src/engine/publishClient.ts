import { PUBLISH_API_URL, PUBLISH_REQUEST_TIMEOUT_MS } from '../config/publish';
import type { RemoteContentBundle } from '../types/remoteContent';
import type { WriterDraftBundle } from '../types/writer';

export type PublishAction = 'approve' | 'reject';

export type PublishReviewOptions = {
  override?: boolean;
  overrideReason?: string;
};

export type PublishRequestError = Error & {
  status?: number;
  payload?: any;
};

export type PublishResult = {
  ok: true;
  action: PublishAction;
  reviewedAt: string;
  contentVersion: string;
  content?: RemoteContentBundle;
  insightId?: string;
  alreadyProcessed?: boolean;
  safety?: {
    backupPath?: string;
    backupCommitSha?: string;
    validatedAt?: string;
  };
  commit?: {
    commitSha?: string;
    contentSha?: string;
    htmlUrl?: string;
  };
};

export async function reviewWriterDraft(
  writerDraft: WriterDraftBundle,
  action: PublishAction,
  token: string,
  options: PublishReviewOptions = {},
): Promise<PublishResult> {
  if (!PUBLISH_API_URL.trim()) {
    throw new Error('PUBLISH_API_URL is not configured.');
  }
  if (!token.trim()) {
    throw new Error('Publish token is required.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLISH_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(PUBLISH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publish-token': token.trim(),
      },
      body: JSON.stringify({ action, writerDraft, ...options }),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Publish service returned invalid JSON (${response.status}).`);
    }

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || `Publish request failed (${response.status}).`);
    }

    return payload as PublishResult;
  } finally {
    clearTimeout(timeout);
  }
}
