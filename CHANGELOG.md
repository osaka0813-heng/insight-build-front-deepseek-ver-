# Changelog

## Build011.5 — Review & Publish

- Added one-time-token review controls to Writer Drafts.
- Added Approve & Publish and Reject actions.
- Added `/api/publish` to update the front-end `remote-content.json` through the GitHub Contents API.
- Approved drafts now update Insight, Daily State, World Process Evolution, and Writer Draft status in one commit.
- The app refreshes remote content after review.
- Publish credentials remain server-side; the app never stores the one-time publish token.

## Build010.4 Revision B

- Corrected the language switcher vertical position on the No New Global Insight screen.
- Removed the redundant English `Insight` marker from page 5.

## Build009.4 UX Revision I

- Restored page 02, 04, and 05 content to their pre-Revision-H vertical positions without restoring deleted duplicate text.

# Build009.4

- Added Process Evolution model and localized timelines.
- Added current stage and stage summaries.
- Added support/update/challenge evidence impacts.
- Added EvolutionScreen and overlay navigation.
- Added Observe Next indicators to World Process pages.

# Changelog

## Build009.3 Revision B
- Added Related Process Engine with automatic scoring.
- Added Geopolitical Technology Control as an independent process.
- Added cross-domain AI ↔ Energy ↔ Semiconductors ↔ Geopolitics recommendations.
- Added localized “why related”, score, shared concepts and editorial confirmation.

## 2026-07-31 Daily Insight Update
- Added a new current Living Insight: AI enters the industrial-finance phase.
- Added source-backed signal exploration for project finance, public industrial sites and utility demand.
- Extended the AI Infrastructure Race evolution timeline and Observe Next items.

## Build009.4 Revision UX-1 — 2026-08-01
- Restored the cover label to Today’s Observe / 今日观察 / 今日の観察.
- Removed the persistent My World shortcut from the top of all six reading pages.
- Added a deliberate right-swipe gesture from the reading surface to open My World.
- Kept My World in the final-page navigation bar.
- Removed repeated previous-Insight copy from cover/question explorer paths and rewrote the update bridge.
- Removed the standalone Sources section from the signal root sheet.
- Expanded each current signal evidence card to three linked sources where available.

### Build009.4 UX Revision B
- Simplified the Structure Change page: only the Shift card remains interactive.
- Removed duplicate Explore actions from Before and Now.

## Build009.4 UX Revision C — 2026-08-01
- Rebuilt the cover deep-dive so it no longer repeats the cover title and summary.
- The first-page deep-dive now explains the question, structural shift, why it matters, and what to observe next.
- Added a horizontal page transition when opening My World.
- Added left-swipe navigation from My World back to the exact reading page.
- Back and Continue Reading actions now use the same transition animation.

## Build009.4 UX Revision E — My World clarity
- Removed the process / insight / following counter row from My World.
- Rebuilt the black Continue Exploring card as a traceable Insight card.
- The card now shows date, World Process path, Insight title, summary, evidence status, and opens the exact Insight.
- Falls back to today's current Insight when no reading history exists.

## Build009.4 UX Revision F
- Removed traceable insight card from My World.
- Added swipe-left History navigation with matching animated return.

## Build009.4 UX Revision G
- Removed My World and reassigned right swipe to World Process.
- Added animated swipe-back from World Process while preserving reader state.

## Build009.4 UX Revision H
- Removed repeated bottom note from the Question page.
- Removed repeated conclusion from the Structure page.
- Simplified the Hero Insight page to the central insight only.

## Build010.1 — Daily State
- Added the three-state Daily Intelligence Loop data model.
- Added localized daily publishing decisions and threshold metadata.
- Added daily-state repository lookup by date and Insight.
- Added a subtle state badge without replacing the Today’s Observe label.
- Added a compact Today’s Decision summary to the final reading page.

## Build010.2
- Added deterministic Daily Decision Engine and candidate-signal scoring.
- Daily state is now computed rather than selected from the seed.

## Build010.3
- Added the dedicated No New Global Insight daily landing.
- Added rule-engine-driven 2026-08-01 no-material-update experience.
- Added supporting-signal summary, threshold explanation, active process, Observe Next, and previous Insight continuation.
- Added navigation back to today from the previous Insight.

## Build010.4
- Added Daily Continuity: last reading, new signals since then, and current judgment.
- Integrated continuity into the no-new landing and the sixth reading page.
- Reused LivingMemory reading history without restoring the removed My World screen.


## Build010.4 Revision A
- Increased separation between the Daily State / confidence badges and the language switcher on the cover page.

## Build011.1 — Remote Content Bridge

- Added a versioned remote content JSON contract.
- Added startup and foreground remote synchronization.
- Added last-known-good AsyncStorage caching.
- Added runtime payload validation and safe local fallback.
- Converted Insight, Daily State and World Process repositories to live runtime data.
- Preserved Build010.4 navigation, gestures and reading continuity.

## Build011.2
- Added server-side AI Researcher with web search and structured candidate output.
- Added review-only research draft data model and app screen.
- Added source traceability, process matching and scoring fields.
- Added Vercel deployment files and draft-to-remote-content merge script.

## Build011.3
- Added AI Analyst normalization and daily-state decisions.
- Normalized accidental 0–10 scores to 0–100.
- Added trigger/corroborating/context source roles.
- Matched drafts against existing World Processes.
- Added analyst decisions and warnings to the AI Draft review screen.

## Build011.4
- Added AI Writer draft generation contract.
- Added six-page Writer Draft preview.
- Added writerDrafts to Remote Content.
- Added manual approval and merge workflow.
