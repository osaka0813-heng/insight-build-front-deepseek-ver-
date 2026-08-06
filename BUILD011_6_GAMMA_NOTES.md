# Build011.6 Gamma — Publish Sync Fix

- The publish API response's exact `contentVersion` is now used as the synchronization target.
- After publishing, the app polls the public `remote-content.json` endpoint until that version is visible.
- GitHub Raw propagation delay no longer causes the app to accept and cache the previous version.
- On successful synchronization, the editorial console closes automatically and the reader follows the latest Insight.
- If propagation takes too long, the app reports that publishing succeeded but synchronization is still pending.
