# Versioning workflow

Both `canvas-sync/` and `canvas-server-check/` are versioned. Before every change, explicitly name the target directory or directories. Never assume that one directory is newer than the other.

## Before a change

1. Run `git status --short` and inspect existing changes.
2. Create a focused branch, for example `git switch -c fix/ticket-navigation`.
3. Record which Canvas directory is the source for the task.

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
