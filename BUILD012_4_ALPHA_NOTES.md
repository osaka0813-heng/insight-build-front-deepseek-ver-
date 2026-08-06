# Build012.4 Alpha — Release Reliability & Data Protection

## Added

- Public backend health check.
- Protected production preflight before approval.
- Approval buttons remain locked until preflight passes.
- Preflight checks:
  - required environment variables
  - GitHub repository access
  - remote-content JSON parsing
  - schema and collection integrity
  - duplicate IDs
  - current Daily State references
  - backup-write capability
- Automatic GitHub backup before every content-changing publish.
- Idempotent publish behavior:
  - repeated approve/reject requests do not create duplicate Insights or commits
  - the current content is returned safely
- The editor displays the latest backup path.
- Safety outcomes are written to the local editorial log.

## Scope

This is the production-safety layer planned for 012.4. Automatic rollback UI is intentionally reserved for a later revision; this build creates recoverable backups and blocks unsafe writes.
