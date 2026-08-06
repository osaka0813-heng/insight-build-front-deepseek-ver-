# Build011.5.1 — Remote Content Display Fix

- Bundles the latest approved `remote-content.json` as the local fallback.
- Changes AsyncStorage cache key from v1 to v2 to discard stale cached content.
- Refreshes remote content whenever the preview/app becomes active.
- Adds cache-busting request headers and a timestamp query string.
- Latest Chinese cover title begins with: `美国能源部据报选定 Brookfield 开发帕杜卡 AI 园区`.
