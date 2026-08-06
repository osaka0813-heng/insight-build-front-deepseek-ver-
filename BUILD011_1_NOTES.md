# Build011.1 — Remote Content Bridge

## Objective

Move Insight's runtime content source away from compile-time-only seed files and introduce a safe remote JSON bridge without changing the established Build010 reading experience.

## Runtime flow

1. The app boots immediately with the bundled local fallback.
2. It restores the last validated remote bundle from AsyncStorage when available.
3. It requests the configured HTTPS JSON endpoint.
4. The payload is validated before it can replace runtime content.
5. A successful payload is cached and all repositories update in place.
6. A failed request leaves the last known-good content visible.
7. Returning the app to the foreground triggers a refresh after the minimum interval.

## New files

- `src/types/remoteContent.ts`
- `src/config/remoteContent.ts`
- `src/data/localContentBundle.ts`
- `src/engine/runtimeContentStore.ts`
- `src/engine/remoteContentValidator.ts`
- `src/state/RemoteContentProvider.tsx`
- `remote-content.example.json`

## Repository changes

The following repositories now resolve data from `runtimeContentStore` instead of importing immutable seeds directly:

- `insightRepository`
- `dailyStateRepository`
- `worldProcessRepository`

This means a validated remote payload can update Today's Insight, the daily decision, archive, World Processes, Connections and Evolution without rebuilding the mobile app.

## Configure the endpoint

Edit:

`src/config/remoteContent.ts`

Set `REMOTE_CONTENT_URL` to a public HTTPS JSON file. A GitHub Raw URL is sufficient for early testing.

## Safety behavior

- API keys are not stored in the app.
- Invalid payloads never replace active content.
- Remote failures do not blank the app.
- Cached content is schema-validated before use.
- The bridge uses an 8-second timeout.

## Build011.1 scope boundary

This build does not call an AI model. It establishes the contract and delivery path that Build011.2 will use for AI-generated candidate signals.
