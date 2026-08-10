import {
  ADMIN_VERIFY_URL,
  EDITORIAL_ADMIN_SESSION_MS,
} from '../config/editorial';

export type AdminSession = {
  verifiedAt: string;
  expiresAt: string;
};

export async function verifyAdminAccess(
  adminToken: string,
): Promise<AdminSession> {
  if (!adminToken.trim()) throw new Error('请输入管理员访问码。');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(ADMIN_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken.trim(),
      },
      body: JSON.stringify({ purpose: 'editorial-console' }),
      signal: controller.signal,
    });

    const text = await response.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`管理员验证服务返回了无效数据（${response.status}）。`);
    }

    if (!response.ok || payload?.ok !== true) {
      throw new Error(payload?.error || `管理员验证失败（${response.status}）。`);
    }

    return {
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + EDITORIAL_ADMIN_SESSION_MS,
      ).toISOString(),
    };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('管理员验证超时，请检查网络后重试。');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
