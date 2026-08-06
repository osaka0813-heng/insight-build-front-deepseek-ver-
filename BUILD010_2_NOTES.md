# Build010.2 — Daily Decision Engine

Build010.2 replaces the manually selected daily state with a deterministic rule engine.

## Added
- Candidate signal model with importance, novelty, evidence, thesis impact, relationship change, stage change, contradiction and independent-source count.
- `dailyDecisionEngine` that compares candidate signals with an existing World Process.
- Automatic output: `publish_new`, `update_living`, or `no_new_global_insight`.
- Threshold reasons and decisive signal IDs.
- Daily state repository now overrides seeded labels/scores with engine results.

## Decision rules
- Publish New: no matched process + high novelty, importance, evidence and material change.
- Update Living: matched process + strong evidence + meaningful thesis/relationship/stage change.
- No New: insufficient evidence/material change or support-only signals.

This remains an offline deterministic engine. It does not fetch live news or call an AI model.
