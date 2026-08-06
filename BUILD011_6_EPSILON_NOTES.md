# Build011.6 Epsilon — Explicit Reader Switch

Previous builds updated the runtime content store but relied on the reader to infer that it should follow the new current Insight.

This build removes that ambiguity:

1. The publish result returns the exact published `insightId`.
2. The app installs the returned content bundle.
3. The editorial console explicitly tells `AppNavigator` to:
   - set `readerInsightId` to the published Insight,
   - disable the No-New daily landing,
   - close all overlays.
4. The reader opens the published content directly.

This fixes cases where content was successfully installed but the visible reader remained on the previously selected Insight.
