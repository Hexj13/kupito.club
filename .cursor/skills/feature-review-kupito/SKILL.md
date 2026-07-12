---
name: feature-review-kupito
description: Reviews current uncommitted or unpushed changes in kupito.club/PPCSL for optimization, security, release readiness, and documentation impact. Use when the user asks to review a feature, analyze current changes, optimize implementation, harden security, or update docs/legal after code changes.
---

# Feature Review Kupito

## Use this skill when

- The request is about current uncommitted or unpushed changes.
- The user asks for optimization, security review, hardening, or final quality pass.
- The task should end with release checks and documentation sync.

## Workflow

1. Scope the change set.
- Run `git status`, `git diff`, `git diff --staged`, and `git log origin/main..HEAD --oneline` from repo root.
- If needed, inspect `core/` separately because this repo uses a core submodule.
- When codebase-memory-mcp is available, call `detect_changes` (project `Users-tarantullo-kupito.club`) for blast radius and related symbols; see `.cursor/skills/codebase-memory-kupito/SKILL.md`.
- Treat only changed files and closely related call sites as the review scope.

2. Review optimization.
- Check frontend for unnecessary re-renders, duplicated fetching, redundant state, heavy work in render paths, and obvious memoization gaps.
- Check backend for redundant DB/external calls, missing caching opportunities, and inefficient request flow.
- Prefer small, targeted improvements. Do not refactor for style only.

3. Review security.
- Verify validation, auth/access, sensitive data handling, logging, redirects, and third-party integrations.
- Fix real vulnerabilities or clear misuse. Do not change business behavior unless it is a security issue.

4. Respect project architecture.
- Root is source of truth for `locales/`, `locales/backend/`, `theme/`, `config/`, and `assets/`.
- Core implementation lives in `core/`.
- Do not edit generated copies in `core/frontend/lib/`, `core/frontend/public/`, or `core/backend/src/common/i18n/` when the root file is the source of truth.
- If translations or config change, run `npm run prepare:build`.

5. Run release validation.
- Run `npm run release-check` from repo root.
- Fix lint, format, tests, or build failures and rerun until green.

6. Run frontend e2e (after release-check is green).
- From `core/frontend`: `npm run test:e2e:allure` (Playwright + Allure report generation).
- Optionally open the report: `npm run test:e2e:allure:open`.
- Requires running dev server and API locally (or set `PLAYWRIGHT_SKIP_WEBSERVER=1` when already up).
- Fix failing specs or flaky flows and rerun until green.

7. Run docs sync.
- Update `core/docs/`, `docs/`, `core/backend/docs/`, or `core/frontend/docs/` only if the implementation changed behavior, setup, or operational details.
- Update `config/legal.ts` only if data processing, third-party services, retention, user obligations, or partner/legal text changed.
- Keep docs short, factual, and in English.

## Project-specific checks

- No hardcoded UI text. Use translation keys.
- Add translation keys to all required language files.
- Keep tests in English.
- Avoid code comments unless explicitly requested.
- Follow existing patterns in frontend and backend.

## Output

Return a short summary with:
- scope of reviewed files
- optimization changes or confirmed no-action
- security changes or confirmed no-action
- `release-check` result
- e2e / Allure result (or skipped reason)
- docs/legal updates or confirmed no-action

## References

- `.cursor/commands/feature-review.md`
- `.cursor/commands/release-check.md`
- `.cursor/commands/docs-update.md`
- `.cursor/skills/codebase-memory-kupito/SKILL.md`
- `.cursor/rules/architecture.mdc`
