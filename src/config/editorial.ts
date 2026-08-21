export const INSIGHT_API_BASE_URL = 'https://insight-build-back-deepseek-ver.vercel.app';
export const EXPECTED_BACKEND_VERSION = '014.2-recovery-global';
export const RESEARCH_API_URL = `${INSIGHT_API_BASE_URL}/api/research`;
export const ANALYZE_API_URL = `${INSIGHT_API_BASE_URL}/api/analyze`;
export const WRITE_API_URL = `${INSIGHT_API_BASE_URL}/api/write`;
export const EDITORIAL_REQUEST_TIMEOUT_MS = 300_000;
export const ADMIN_VERIFY_URL = `${INSIGHT_API_BASE_URL}/api/admin-verify`;

export const LEGACY_EDITORIAL_TOKEN_STORAGE_KEY = '@insight/editorial/tokens/v1';
export const EDITORIAL_RESEARCH_TOKEN_KEY = 'insight.editorial.research-token.v2';
export const EDITORIAL_PUBLISH_TOKEN_KEY = 'insight.editorial.publish-token.v2';
export const EDITORIAL_ADMIN_SESSION_KEY = 'insight.editorial.admin-session.v1';
export const EDITORIAL_PIPELINE_STORAGE_KEY = '@insight/build014/editorial/pipeline/v1';
export const EDITORIAL_LOG_STORAGE_KEY = '@insight/editorial/logs/v1';
export const EDITORIAL_ADMIN_SESSION_MS = 10 * 60 * 1000;

export const PREFLIGHT_API_URL = `${INSIGHT_API_BASE_URL}/api/preflight`;
export const HEALTH_API_URL = `${INSIGHT_API_BASE_URL}/api/health`;

export const ROLLBACK_API_URL = `${INSIGHT_API_BASE_URL}/api/rollback-latest`;

export const AUTO_START_API_URL = `${INSIGHT_API_BASE_URL}/api/auto-start`;
export const AUTO_STATUS_API_URL = `${INSIGHT_API_BASE_URL}/api/auto-status`;
export const AUTO_RESUME_API_URL = `${INSIGHT_API_BASE_URL}/api/auto-resume`;
export const EDITORIAL_AUTO_JOB_STORAGE_KEY = '@insight/editorial/auto-job/v1';
