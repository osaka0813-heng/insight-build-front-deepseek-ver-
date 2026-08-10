import {
  HEALTH_API_URL,
  PREFLIGHT_API_URL,
  ROLLBACK_API_URL,
} from '../config/editorial';

export type PreflightCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PreflightResult = {
  ok: boolean;
  checkedAt: string;
  contentVersion?: string;
  repository?: string;
  checks: PreflightCheck[];
};

async function parseJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`服务返回了无效 JSON（${response.status}）。`);
  }
}

export async function checkBackendHealth(): Promise<{
  ok: boolean;
  version?: string;
  checkedAt?: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(HEALTH_API_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    const payload = await parseJson(response);

    if (!response.ok || payload?.ok !== true) {
      throw new Error(payload?.error || `后端健康检查失败（${response.status}）。`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runProductionPreflight(
  publishToken: string,
): Promise<PreflightResult> {
  if (!publishToken.trim()) {
    throw new Error('请先填写 Publish API Token。');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(PREFLIGHT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publish-token': publishToken.trim(),
      },
      body: JSON.stringify({ scope: 'publish' }),
      signal: controller.signal,
    });

    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(payload?.error || `发布前检查失败（${response.status}）。`);
    }

    return payload as PreflightResult;
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('发布前检查超时，请确认 Vercel 和 GitHub 状态。');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function rollbackLatestBackup(
  publishToken: string,
): Promise<{
  ok: boolean;
  contentVersion: string;
  backupPath: string;
  content: any;
}> {
  const response = await fetch(ROLLBACK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publish-token': publishToken.trim(),
    },
    body: JSON.stringify({ confirm: true }),
  });

  const payload = await parseJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error || `恢复备份失败（${response.status}）。`);
  }
  return payload;
}
