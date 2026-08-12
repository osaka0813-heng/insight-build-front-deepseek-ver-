# Build013 Delta — Expo Resume Fix

Fixes:
- The four-scope button is no longer disabled by manual Research/Analyze/Write state.
- A stale server-side `running` job no longer traps the UI in an unclickable state.
- The main button becomes `继续 / 唤醒四区域自动更新` for any unfinished job.
- `从服务器断点继续` is always visible for any unfinished server job.
- Manual continuation buttons are derived from saved artifacts, not transient UI error flags:
  - Research saved + Analyze missing -> Analyze resume button
  - Analyze saved + Writer missing -> Write resume button
- Writer checkpoints show EN/ZH/JA completion inline.
