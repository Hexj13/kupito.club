---
name: ponytail-review-kupito
description: >
  Review diffs or scoped code for over-engineering only. Produces a delete-list
  (reinvented stdlib, unneeded deps, speculative abstractions, dead flexibility).
  Use when the user asks to review for over-engineering, what can be deleted,
  whether something is over-engineered, or a simplify/complexity review.
  Complements feature-review-kupito (security/release/docs) — this skill only
  hunts unnecessary complexity.
---

# Ponytail Review Kupito

## Use this skill when

- The user wants an over-engineering / simplify / delete-list review.
- Scope is a current diff, a named feature, or a small set of files.

## Do not use this skill when

- The ask is security, release-check, docs/legal, or full feature QA — use `feature-review-kupito`.
- The user wants you to apply the cuts automatically (list only unless they explicitly ask to implement).

## Workflow

1. Scope the change set (`git status` / `git diff` / named paths). In this repo, inspect `core/` separately when the submodule is involved.
2. Hunt complexity only. Do not expand into correctness, security, or performance unless a finding is purely "delete unused flexibility".
3. Output one line per finding. Do not apply fixes unless the user asks.

## Format

`path:Lstart-Lend: tag: short finding. Replacement.`

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does — only when no project UI kit / pattern covers it.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

End with: `net: -N lines possible.` If nothing to cut: `Lean already. Ship.`

## Project boundaries

- Do not suggest raw HTML/native controls in place of existing UI kit (`InfoBlock`, `HintTooltip`, `MobileSelectField`, theme, i18n).
- Do not suggest deleting required i18n keys, theme usage, architecture boundaries, or legitimate Jest/Playwright tests.
- Do not suggest adding `ponytail:` or other code comments.
- Prefer reuse of existing helpers/patterns over inventing a "simpler" parallel path that breaks platform/core SoT rules.
