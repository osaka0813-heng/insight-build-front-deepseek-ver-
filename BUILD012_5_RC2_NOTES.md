# Build012.5 RC2 — Semantic Placeholder Guard

- Treats placeholder strings such as “无字段”, “No field”, and “フィールドなし” as invalid content.
- A malformed newest Insight is skipped, allowing the reader to fall back to the latest valid Insight.
- Field-level language fallback no longer accepts placeholder text.
