# Remote Content Bridge — Test Guide

## 1. Upload the project

Upload the project to GitHub with the existing folder structure. Keep `remote-content.json` in the repository root.

## 2. Copy the Raw URL

Open `remote-content.json` on GitHub, choose **Raw**, and copy the HTTPS address. It will look similar to:

`https://raw.githubusercontent.com/USER/REPOSITORY/main/remote-content.json`

## 3. Configure the app

Open:

`src/config/remoteContent.ts`

Paste the Raw URL into `REMOTE_CONTENT_URL`.

## 4. Verify the bridge

Change these two fields in `remote-content.json`:

- `contentVersion`
- A visible title or summary inside the latest Insight

Commit the JSON change. Reopen the app or return it from the background after five minutes. The app should update without rebuilding the TypeScript application.

## 5. Failure test

Temporarily make the URL invalid. The app should continue to show the last validated content instead of showing a blank screen.

## Payload rule

The remote file must keep all four non-empty arrays:

- `insights`
- `worldProcesses`
- `dailyStates`
- `dailyCandidates`

It must also keep `schemaVersion: 1` until the mobile app supports a later schema.
