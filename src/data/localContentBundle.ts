import bundledRemoteContent from './remoteContentSeed.json';
import type { RemoteContentBundle } from '../types/remoteContent';

/**
 * Build011.5.1 bundles the latest approved remote payload as the offline fallback.
 * This prevents Expo/Appetize from showing the old seed when GitHub Raw is
 * temporarily cached, blocked, or unavailable during preview startup.
 */
export const localContentBundle = bundledRemoteContent as RemoteContentBundle;
