# Cursor project config

Shared in git (team-wide):

- `rules/` — project rules (`.mdc`)
- `commands/` — slash commands
- `skills/` — project skills (`SKILL.md`)

Local only (not committed):

- `settings.json` — personal plugin toggles
- `plans/` — generated plan files
- `worktrees.json` — local worktree setup

Edit shared files here; they apply when the repo is opened in Cursor.

## Git

Repo `.gitignore` un-ignores `rules/`, `commands/`, `skills/`, and this README. Many machines also have `~/.config/git/ignore` with a blanket `.cursor/` rule — that blocks normal `git add` until paths are tracked once.

First-time add (maintainers):

```bash
git add .gitignore
git add -f .cursor/README.md .cursor/rules/ .cursor/commands/ .cursor/skills/
```

After that, edits to tracked files show up in `git status` without `-f`.

Optional: narrow the global ignore to local-only paths instead of all of `.cursor/`:

```
.cursorrules
**/.cursor/settings.json
**/.cursor/plans/
**/.cursor/worktrees.json
```
