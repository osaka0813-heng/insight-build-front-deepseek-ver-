# Build013 Epsilon — Auto Client Import Fix

Root cause:
`EditorialConsoleScreen.tsx` called `startAutoJob`, `loadAutoJob`, and
`resumeAutoJob` but did not import them from `../engine/autoEditorialClient`.

This caused the runtime error:
`Property 'startAutoJob' doesn't exist`

Fix:
- import `startAutoJob`
- import `loadAutoJob`
- import `resumeAutoJob`
- import `AutoJob` type

Backend changes are not required.
