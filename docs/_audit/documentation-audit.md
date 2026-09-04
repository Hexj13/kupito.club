---
title: Documentation Audit
status: audit
accuracy: partial
migration_action: keep
tags:
  - type/audit
  - domain/docs
  - scope/platform
  - status/active
owner: platform
last_updated: "2026-06"
---

# Documentation Audit (Phase 1)

> **Snapshot (2026-06):** Partial inventory from the documentation refactor. Some rows are outdated (for example `core/docs/audits/` was merged into `core/docs/reference/`; Playwright uses two projects `mobile` and `desktop` only). Prefer [core/docs/README.md](../../core/docs/README.md) and live workflow files for current truth.

## 1. Inventory

### 1.1 Markdown files (root and core)

| Path                                     | Purpose                   | Status | Accuracy | Action        | Target section         |
| ---------------------------------------- | ------------------------- | ------ | -------- | ------------- | ---------------------- |
| README.md                                | Platform root nav         | active | accurate | update        | root                   |
| docs/README.md                           | Platform docs index       | active | accurate | keep/update   | platform root          |
| docs/deployment/production-deployment.md | Moldova deploy            | active | accurate | keep          | operations             |
| docs/setup/setup.md                      | Platform setup            | active | accurate | keep          | engineering            |
| docs/sentry/sentry-setup.md              | Sentry step-by-step       | active | accurate | merge → core  | operations             |
| docs/sentry/sentry-launch-checklist.md   | Sentry launch             | active | accurate | merge → core  | operations             |
| docs/popular-brands-sync.md              | Script doc (shared)       | active | accurate | move → core   | reference/scripts      |
| assets/README.md                         | Assets structure (shared) | active | accurate | merge → core  | reference              |
| core/README.md                           | Core submodule nav        | active | accurate | update        | core root              |
| core/docs/README.md                      | Core docs nav             | active | accurate | update        | architecture           |
| core/docs/architecture/\*.md             | Architecture              | active | partial  | update/rename | architecture           |
| core/docs/guides/\*.md                   | Guides                    | active | partial  | update/rename | engineering/operations |
| core/docs/features/\*.md                 | Feature docs              | active | partial  | update/rename | domains                |
| core/docs/reference/brands-models-master-plan.md | Scripts reference        | active | accurate | keep          | reference              |
| core/docs/analytics/\*.md                | Analytics                 | active | accurate | update/rename | reference              |
| core/docs/reference/npm-audit-and-deprecations.md, reference/seo-audit.md | Audits (moved) | active | accurate | keep | reference |
| core/docs/engineering/linting.md         | Linting                   | active | accurate | keep          | engineering            |
| core/docs/features/TODO.md               | Project TODO              | active | accurate | consolidate   | master TODO            |
| core/backend/docs/\*.md                  | Backend docs              | active | accurate | update/rename | engineering            |
| core/frontend/docs/\*.md                 | Frontend docs             | active | accurate | update/rename | engineering            |
| core/frontend/config/README.md           | Config                    | active | accurate | keep          | engineering            |

### 1.2 Cursor rules (`.cursor/rules/*.mdc`)

- architecture.mdc, backend-architecture.mdc, catalog-data.mdc, code-style.mdc, dev-ready-plans.mdc, documentation.mdc, e2e-playwright.mdc, frontend-ui.mdc, git-safety.mdc, ponytail.mdc, pre-release-hygiene.mdc, testing-linting.mdc, tests-english.mdc, translations.mdc

**Action:** Keep global rules concise and use contextual rules for backend, catalog, docs, E2E, frontend UI, and tests.

### 1.3 Cursor commands (`.cursor/commands/*.md`)

- No command docs are currently present in `.cursor/commands/`.

**Action:** Keep this section only as historical inventory from Phase 1.

### 1.4 Skills (`.cursor/skills/*/SKILL.md`)

- legal-update-kupito, parallel-executors, platform-docs-sync, feature-review-kupito

**Action:** Keep; ensure they reference new doc paths after migration.

## 2. Naming violations

- UPPER_SNAKE_CASE in core: ARCHITECTURE_OVERVIEW.md, KNOWN_ISSUES.md, TECHNICAL.md, PLATFORM_CHECKLIST.md, SENTRY.md, etc. → rename to kebab-case.
- No `notes.md` / `temp.md` / `new-doc.md` in inventory (good).

## 3. Source-of-truth matrix

| Topic                 | Current SOT                                                                                   | After migration                                               |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Sentry setup          | docs/sentry/sentry-setup.md + core/docs/guides/sentry.md                                      | core/docs/guides/sentry.md (+ platform env in root)           |
| Popular brands script | docs/popular-brands-sync.md                                                                   | core/docs/reference/popular-brands-sync.md                    |
| Platform assets       | assets/README.md + PLATFORM_CHECKLIST                                                         | core/docs/reference/platform-assets.md                        |
| Deployment            | core/docs/guides/deployment.md (generic) + docs/deployment/production-deployment.md (Moldova) | Unchanged split                                               |
| Platform setup        | docs/setup/setup.md                                                                           | Root docs/setup only                                          |

## 4. Gap analysis

- **Missing (resolved in core):** `core/docs/engineering/documentation-standards.md` (format, headings, tags).
- **Missing (resolved in core):** `core/docs/engineering/obsidian-usage.md` (repo vs vault, tags, MOC).
- **Missing:** Single master TODO document; reference from features/TODO and elsewhere.
- **Missing:** ADR index and initial ADRs (e.g. doc structure decision).
- **Missing:** Tag taxonomy document (type/_, domain/_, status/_, ops/_).

## 5. TODO consolidation (collected)

From core/docs/features/TODO.md and grep:

- Internal links (SimilarListings, homepage popular combos).
- Alt tags / OpenGraph (done).
- Content strategy (blog, backlinks, local SEO) — long-term.
- All → move to single master TODO; remove or shorten features/TODO.md.

## 6. Tag taxonomy (draft)

- **type/** — doc type: type/readme, type/guide, type/architecture, type/runbook, type/reference, type/adr, type/prompt, type/audit.
- **domain/** — business area: domain/listings, domain/search, domain/brands-models, domain/docs, domain/ops.
- **status/** — lifecycle: status/active, status/deprecated, status/draft.
- **ops/** — operations: ops/deploy, ops/monitoring, ops/runbook.
- **scope/** — scope: scope/core, scope/platform.

Required minimum per doc: one type/_, one scope/_ (core or platform), status/active or status/draft.
