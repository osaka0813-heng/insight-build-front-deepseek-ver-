export const INSIGHT_API_BASE_URL = 'https://insight-build-back.vercel.app';
export const RESEARCH_API_URL = `${INSIGHT_API_BASE_URL}/api/research`;
export const ANALYZE_API_URL = `${INSIGHT_API_BASE_URL}/api/analyze`;
export const WRITE_API_URL = `${INSIGHT_API_BASE_URL}/api/write`;
export const EDITORIAL_REQUEST_TIMEOUT_MS = 300_000;
export const ADMIN_VERIFY_URL = `${INSIGHT_API_BASE_URL}/api/admin-verify`;

export const LEGACY_EDITORIAL_TOKEN_STORAGE_KEY = '@insight/editorial/tokens/v1';
export const EDITORIAL_RESEARCH_TOKEN_KEY = 'insight.editorial.research-token.v2';
export const EDITORIAL_PUBLISH_TOKEN_KEY = 'insight.editorial.publish-token.v2';
export const EDITORIAL_ADMIN_SESSION_KEY = 'insight.editorial.admin-session.v1';
export const EDITORIAL_PIPELINE_STORAGE_KEY = '@insight/editorial/pipeline/v1';
export const EDITORIAL_LOG_STORAGE_KEY = '@insight/editorial/logs/v1';
export const EDITORIAL_ADMIN_SESSION_MS = 10 * 60 * 1000;

export const PREFLIGHT_API_URL = `${INSIGHT_API_BASE_URL}/api/preflight`;
export const HEALTH_API_URL = `${INSIGHT_API_BASE_URL}/api/health`;

export const ROLLBACK_API_URL = `${INSIGHT_API_BASE_URL}/api/rollback-latest`;
