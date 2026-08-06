# Build011.5 — Review & Publish

Build011.5 closes the final mile between an AI Writer draft and the content shown by the App.

## Flow

Research → Analyst → Writer Draft → Human Review → GitHub commit → Remote Content refresh → App

## Front-end

The Writer Draft screen now includes:

- Six-page preview
- Quality checks
- One-time publish-token field
- Approve & Publish
- Reject
- Published / rejected status after the remote content refreshes

The token is held only in component memory and is never stored.

## Back-end

`POST /api/publish`

Headers:

- `Content-Type: application/json`
- `x-publish-token: <PUBLISH_API_TOKEN>`

Body:

```json
{
  "action": "approve",
  "writerDraft": {}
}
```

Approval merges the Writer Draft into `remote-content.json` and commits it to the front-end GitHub repository. Rejection only updates the draft status.

## Required Vercel environment variables

- `PUBLISH_API_TOKEN`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `REMOTE_CONTENT_PATH`

The GitHub token must be able to read and write repository contents for the front-end repository.
