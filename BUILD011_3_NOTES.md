# Build011.3 — AI Analyst

Build011.3 connects AI Researcher drafts to the existing Insight decision system.

## Fixed
- Scores returned on a 0–10 scale are automatically normalized to 0–100.
- Existing World Processes are used for matching before proposing a new process.
- Sources are separated into trigger, corroborating and context roles.
- Context sources cannot trigger a daily update by themselves.
- Research copy no longer needs Markdown links; URLs remain in the sources array.
- Analyst output classifies support, update, challenge or no material change.
- Every candidate receives Publish New, Update Living or No New Global Insight.

## Frontend
The AI Draft screen displays the analyst decision, matched process, source-role counts, warnings and normalized scores.

## Backend
- `POST /api/research` researches and analyzes in one request.
- `POST /api/analyze` analyzes an existing draft without calling OpenAI.
- A bundled World Process catalogue is used when the caller does not provide one.
