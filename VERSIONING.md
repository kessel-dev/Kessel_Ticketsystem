# Versioning workflow

`canvas-sync/` is the single working directory for this Canvas app. Do not create additional in-repository copies for synchronization, comparison, validation, or rollback. Git history is the source for checkpoints and restores.

## Before a change

1. Run `git status --short` and inspect existing changes.
2. Create a focused branch, for example `git switch -c fix/ticket-navigation`.
3. Sync, edit, compile, and validate only `canvas-sync/`.

## After a change

1. Compile the affected Canvas directory.
2. Review `git diff --check` and `git diff -- <changed files>`.
3. Commit one logical change with a descriptive message.
4. Do not combine feature work, rollback, and synchronization in one commit.

## Restore a known version

Inspect history before restoring:

```powershell
git log --oneline --all -- path/to/file
git show <commit>:path/to/file
```

Restore only the intended file from a reviewed commit:

```powershell
git restore --source <commit> -- path/to/file
```

Compile the restored Canvas directory before committing the restoration.
