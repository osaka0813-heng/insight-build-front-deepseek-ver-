# Build011.6 Delta — Direct Publish Sync

The publish endpoint now returns the exact `remote-content.json` bundle that it committed.

The app installs that returned bundle immediately into:
- runtime repositories
- the current UI
- AsyncStorage cache

This removes GitHub Raw/CDN propagation from the critical path. GitHub remains the durable source of truth, while the publishing device sees the approved content immediately.

An older-backend polling fallback remains for compatibility.
