# Shared Workspace Rules

## Local disk and execution policy

Treat local disk space as a constrained resource and use a hybrid local/cloud workflow.

- Keep GitHub (or the configured Git remote) as the durable source of truth for every project. Codex Cloud is an execution environment, not a backup.
- Prefer local execution for interactive development, visual inspection, native-app access, final verification, and work that depends on uncommitted local files.
- Prefer cloud execution for long-running, independent, parallel, or dependency-heavy tasks when cloud execution is available and the user has placed that workflow in scope.
- Do not create duplicate project clones, worktrees, dependency directories, build outputs, or downloaded assets unless they are necessary for the task.
- Reuse a suitable existing worktree before creating another one.
- Treat generated outputs, caches, `node_modules`, build directories, simulator data, Docker data, and large media/model assets as potential disk-growth sources. Do not commit caches or generated dependencies unless explicitly required.
- Before deleting or relocating existing material, inventory it, identify whether it contains uncommitted or unique work, and preserve anything valuable. Never perform broad or destructive cleanup without exact targets and user authorization.

## Existing-work reconciliation

1. Check for duplicate clones/worktrees, large generated directories, caches, and untracked outputs relevant to the task.
2. Preserve and consolidate unique source work into the canonical repository or an appropriate branch.
3. Recommend or perform only cleanup that is within the user's request; otherwise report candidates with sizes and recovery implications.
4. Leave the project resumable from Git plus documented external assets, without relying on an abandoned local task directory.
