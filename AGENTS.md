# Agent instructions

## Canvas app workspace

- Use `canvas-sync/` as the single working directory for this Canvas app.
- Sync, edit, compile, and validate the app only in `canvas-sync/`.
- Do not create parallel copies or temporary app directories such as `canvas-server-check/`, `canvas-backup/`, or timestamped variants.
- Use Git commits, branches, tags, and `git restore` for comparisons, checkpoints, and rollback instead of duplicating the app directory.
- If an external tool requires a temporary directory, use the approved system temp location outside this repository and remove it after verification.
- Do not overwrite `canvas-sync/` from another directory without first reviewing the Git diff and preserving the current state in a commit.
