---
name: platform-docs-sync
description: Updates kupito.club and PPCSL documentation to match current implementation and current uncommitted changes. Use when the user asks to update docs, sync docs with code, check whether docs are outdated, update README/docs after changes, or review documentation impact of a feature.
---

# Platform Docs Sync

## Use this skill when

- The user asks to update documentation.
- The task is to check whether docs match current code.
- A feature changed behavior, setup, scripts, or operational flow.
- The request includes README, docs, guides, feature docs, backend docs, or frontend docs.

## Scope

Review these locations when relevant:
- `core/docs/`
- `docs/`
- `core/backend/docs/`
- `core/frontend/docs/`
- `config/legal.ts` only if the feature affects legal text or data processing

## Workflow

1. Gather current changes.
- Run `git status`, `git diff`, `git diff --staged`, and `git log origin/main..HEAD --oneline`.
- Check changed files in both repo root and `core/` when needed.

2. Find documentation impact.
- Update docs if behavior, setup, env vars, scripts, user flow, API contract, or operational details changed.
- Update or add a focused feature doc when a new feature or significant behavior appears.
- Keep `core/docs/README.md` aligned with the actual doc tree when adding or renaming docs.

3. Respect project architecture.
- Root is source of truth for platform files: `locales/`, `locales/backend/`, `theme/`, `config/`, `assets/`.
- Core contains implementation and copied runtime files.
- If changes touch translations or config that are copied into core, run `npm run prepare:build`.

4. Keep docs concise.
- Write in English.
- Prefer short sections, lists, and direct statements.
- Remove outdated or speculative text unless it belongs to an explicit roadmap.
- Prefer small targeted edits over large rewrites.

5. Check consistency.
- If docs say X and code does Y, update docs to Y unless the doc is the intended specification.
- Do not duplicate large code blocks in docs.

## Project-specific rules

- Translation files are not documentation.
- New translation keys belong in root source files, not copied files in core.
- Do not edit generated copies in `core/frontend/lib/`, `core/frontend/public/`, or `core/backend/src/common/i18n/` when root files are the source of truth.

## Output

Return a short summary with:
- docs reviewed
- files updated and why
- files checked but left unchanged
- whether `config/legal.ts` needed changes

## References

- `.cursor/commands/docs-update.md`
- `.cursor/rules/documentation.mdc`
- `.cursor/rules/architecture.mdc`
- `.cursor/rules/translations.mdc`
