---
title: Documentation refactor report
owner: platform
tags:
  - type/audit
  - domain/docs
  - scope/core
  - status/active
---

# Documentation refactor report

## Old → new paths

| Old                                    | New                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| docs/README.md                         | Kept as platform docs index; complements root README + core/docs/README.md            |
| docs/popular-brands-sync.md            | core/docs/reference/popular-brands-sync.md (root file is redirect)                    |
| assets/README.md                       | core/docs/reference/platform-assets.md (root file has summary + link)                 |
| docs/sentry/sentry-setup.md            | Unchanged; top note points to core/docs/guides/sentry.md                              |
| docs/sentry/sentry-launch-checklist.md | core/docs/operations/sentry-launch-checklist.md (root kept as platform-specific copy) |
| core/docs/features/TODO.md             | core/docs/reference/documentation-todo.md (features/todo.md is redirect)              |

## Renamed

- **Naming pass:** Doc filenames in `docs/`, `core/docs/`, `core/backend/docs/`, and `core/frontend/docs/` are kebab-case (or `README.md`). Enforced by `core/scripts/check-doc-filenames.cjs`.

## Merged

- Sentry: shared launch checklist merged into core/docs/operations/sentry-launch-checklist.md; setup remains in guides/sentry.md; platform sentry docs point to core.
- Platform assets: merged into core/docs/reference/platform-assets.md.

## Deprecated

- `core/docs/_deprecated/` created; no docs moved there in this pass.

## Removed

- No platform docs were removed in this pass; `docs/README.md` remains the platform-specific index.

## Added

- core/docs/documentation-architecture.md — target structure, repo vs vault
- core/docs/architecture/adr/0001-documentation-structure.md — ADR for doc structure
- core/docs/reference/popular-brands-sync.md, platform-assets.md, documentation-todo.md
- core/docs/operations/sentry-launch-checklist.md
- core/docs/engineering/documentation-standards.md, obsidian-usage.md
- core/docs/architecture/README.md, adr/README.md
- core/docs/domains/README.md, engineering/README.md, operations/README.md, reference/README.md, prompts/README.md
- core/docs/\_deprecated/README.md
- core/docs/templates/ (README + section-readme, adr, runbook, reference, feature, prompt)
- docs/\_audit/documentation-audit.md — phase 1 audit

## TODO consolidation

- All items from core/docs/features/todo.md moved to core/docs/reference/documentation-todo.md
- features/todo.md replaced with redirect to documentation-todo.md
- core/docs/README.md and reference/README.md link to documentation-todo.md

## Tag taxonomy and rules

- Tags: type/_ (readme, guide, architecture, runbook, reference, adr, prompt, audit), domain/_, scope/core | scope/platform, status/active | status/deprecated
- Minimum per doc: one type, one scope, one status. Defined in documentation-standards.md.

## New rules and commands

- .cursor/rules/documentation.mdc: doc-first workflow, section choice, README nav, Obsidian boundary, frontmatter/tags
- `.cursor/commands/` is currently empty; any command docs mentioned in the original migration notes are no longer present.

## New templates

- core/docs/templates/: README, section-readme.md, adr.md, runbook.md, reference.md, feature.md, prompt.md

## Unresolved / backlog

- Optional: move more feature docs into domains/ with domain-based READMEs.
- sitemap.md previously linked to a missing GSC runbook; link replaced with operations/ and SEO audit.
