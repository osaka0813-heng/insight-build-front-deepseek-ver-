# Build011.2 Deployment Guide

## What runs where

- Expo app: reads `remote-content.json` and displays approved content plus review-only AI drafts.
- Vercel `research-service`: stores the OpenAI API key and runs public-source research.
- GitHub/raw JSON: remains the content bridge used by Build011.1.

## First test

1. Deploy `research-service` to Vercel.
2. Configure `OPENAI_API_KEY`, `OPENAI_MODEL`, and `RESEARCH_API_TOKEN`.
3. POST a research request to `/api/research`.
4. Save the JSON response as `draft.json`.
5. Run:

```bash
cd research-service
node scripts/merge-research-draft.mjs ./draft.json ../remote-content.json
```

6. Commit the updated `remote-content.json` to GitHub.
7. Open the app, enter History, and tap `AI Drafts`.

## Important

Research output is always `draft`. Build011.2 never publishes a candidate directly as a daily Insight.
