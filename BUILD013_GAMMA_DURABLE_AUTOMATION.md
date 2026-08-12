# Build013 Gamma — Durable Expo Frontend

- Four-region automation is now a backend job, not a long foreground JS loop.
- Status is polled every 5 seconds while the editor is open.
- The current job id is stored locally and restored after reopening Expo.
- Manual pipelines are stored per scope.
- Writer language stages EN / ZH / JA have local checkpoints and resume from the last successful stage.
