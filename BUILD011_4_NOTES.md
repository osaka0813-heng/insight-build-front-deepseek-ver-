# Build011.4 — AI Writer

Build011.4 turns an analyzed candidate into a complete, reviewable six-page Insight draft.

## Frontend

- Adds `WriterDraftsScreen`.
- Shows the daily state, matched World Process, quality checks, and a horizontal six-page preview.
- Adds `writerDrafts` to the Remote Content schema.
- AI Writer drafts remain separate from published `insights`.

## Backend

- `POST /api/write` accepts an analyzed Build011.3 research draft.
- It refuses candidates below the publication threshold unless `force: true` is supplied.
- It writes EN / ZH / JA versions using a strict JSON schema.
- It cannot invent source URLs; source IDs and URLs come from the Researcher draft.
- It returns a draft Insight, draft daily state, and optional World Process evolution update.

## Manual publication

A writer draft is not published automatically. Review it, change `status` to `approved`, then run the backend merge script.
