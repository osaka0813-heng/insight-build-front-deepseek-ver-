/**
 * Build011.1 Remote Content Bridge configuration.
 *
 * Paste a public HTTPS JSON endpoint here after deploying the example payload.
 * Leave blank to run entirely from the bundled local content.
 *
 * GitHub raw example:
 * https://raw.githubusercontent.com/<user>/<repo>/main/remote-content.json
 */
export const REMOTE_CONTENT_URL =
  'https://raw.githubusercontent.com/osaka0813-heng/insight-build-front/main/remote-content.json';

export const REMOTE_CONTENT_FETCH_TIMEOUT_MS = 8_000;
export const REMOTE_CONTENT_MIN_REFRESH_INTERVAL_MS = 0;
export const REMOTE_CONTENT_CACHE_KEY = '@insight/remote-content/v2';
