# Build010.1 — Daily State

## Objective
Turn Insight from a static daily reading experience into the first layer of a daily publishing decision system.

## Added
- `DailyInsightState` with three explicit outcomes:
  - `publish_new`
  - `update_living`
  - `no_new_global_insight`
- Localized daily decision records with:
  - decision time
  - linked Insight and World Process
  - previous Insight
  - importance, novelty, evidence and material-change scores
  - user-facing decision title, summary and threshold explanation
- `dailyStateRepository` for current, date and Insight-based lookup.
- A subtle daily-state badge on the first page.
- A compact “Today’s Decision” block on the final page.

## Product rule
The internal states are not used as the main cover label. The cover remains “Today’s Observe / 今日观察 / 今日の観察”. Daily state appears only as supporting context.

## Current demo
The current edition is classified as `update_living`: independent financing, land and utility evidence updates the existing AI Infrastructure Race rather than creating a separate World Process.

## Next
Build010.2 will compare incoming Signals against existing World Process theses and output Support / Update / Challenge / No Material Change.
