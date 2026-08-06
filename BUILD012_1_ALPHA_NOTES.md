# Build012.1 Alpha — World Process Foundation

## Purpose

Turn each World Process from a static collection of related Insights into a durable, evolving record.

## Added foundation fields

- `currentStage`
- `stageChangedAt`
- `confidenceScore`
- `supportingInsightIds`
- `contradictingInsightIds`
- `keyActors`
- `domains`
- `nextSignals`

Evolution events can now also store:

- `changeType`
- `confidenceDelta`
- `previousStage`
- `evidenceIds`

## Backward compatibility

Existing World Process V1 records are upgraded in memory. Older remote-content files remain readable.

## UX

The World Process screen now shows the latest change, its implication, support/challenge counts, and optional numerical confidence before the full timeline.

## Publication behavior

Use the included backend patch. After an approved Insight is merged, it updates the matched World Process, appends or enriches the evolution event, records support/challenge membership, and updates stage metadata.
