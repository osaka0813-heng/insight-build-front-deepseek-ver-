# Build011.2 — AI Researcher

## Objective

Move from a remotely delivered static bundle to a server-side research pipeline that can gather public information and generate structured candidate signals.

## Added

- Server-only OpenAI Responses API integration.
- Built-in web search tool for public-source research.
- Strict JSON-schema output for candidate signals.
- Source metadata, independent-source count and reliability type.
- Process matching and confidence.
- Importance, novelty, evidence and thesis-impact scores.
- Draft-only status: nothing is automatically published.
- AI Research Drafts screen in the app.
- Draft merge script for `remote-content.json`.
- Vercel deployment example and environment template.

## Safety boundary

`OPENAI_API_KEY` is used only by `research-service`. It must never be placed in Expo, GitHub public source, or `src/config/remoteContent.ts`.

## Current limitation

The researcher generates candidates, not final six-page Insights. Human review and approval remain required. Build011.3 will connect approved candidates to the Daily Decision Engine.
