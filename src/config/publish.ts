/** Publish endpoint derived from the single active backend base URL. */
import { INSIGHT_API_BASE_URL } from './editorial';

export const PUBLISH_API_URL =
  `${INSIGHT_API_BASE_URL}/api/publish`;
export const PUBLISH_REQUEST_TIMEOUT_MS = 60_000;
