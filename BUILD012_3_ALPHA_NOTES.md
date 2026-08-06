# Build012.3 Alpha — Editorial Security & Production Resilience

## Security
- Visible AI editor entry removed.
- Open internally by long-pressing the date for 1.8 seconds or tapping it five times within 2.2 seconds.
- Server-side admin verification is required before the editor opens.
- Verified sessions expire after 10 minutes.
- Research and Publish tokens use `expo-secure-store`.
- Legacy plaintext tokens are migrated once and deleted.

## Reliability
- Correct stage-specific errors for Research / Analyze / Write.
- Clear timeout and network failure messages.
- Pipeline snapshots are restored after restart.
- Failed Analyze or Write can resume without repeating Research.
- Duplicate taps are blocked while work is running.
- The device stores the latest 30 editorial logs.
- Successful publication clears the saved pipeline draft.

## Backend
Deploy `api/admin-verify.mjs` and configure `ADMIN_CONSOLE_TOKEN` in Vercel.
