import { localContentBundle } from '../data/localContentBundle';
import type { RemoteContentBundle } from '../types/remoteContent';

let activeBundle: RemoteContentBundle = localContentBundle;
let revision = 0;
const listeners = new Set<() => void>();

export function getRuntimeContentBundle(): RemoteContentBundle {
  return activeBundle;
}

export function getRuntimeContentRevision(): number {
  return revision;
}

export function replaceRuntimeContentBundle(bundle: RemoteContentBundle): void {
  activeBundle = bundle;
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function resetRuntimeContentBundle(): void {
  replaceRuntimeContentBundle(localContentBundle);
}

export function subscribeRuntimeContent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
