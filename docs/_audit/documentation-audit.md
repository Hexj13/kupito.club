---
title: Documentation Audit
status: audit
accuracy: accurate
migration_action: keep
tags:
  - type/audit
  - domain/docs
  - scope/platform
  - status/active
owner: platform
last_updated: "2026-03"
---

# Documentation Audit (Phase 1)

## 1. Inventory

### 1.1 Markdown files (root and core)

| Path | Purpose | Status | Accuracy | Action | Target section |
|------|---------|--------|----------|--------|----------------|
| README.md | Platform root nav | active | accurate | update | root |
| docs/README.md | Platform docs index | active | accurate | remove | — |
| docs/deployment/PRODUCTION_DEPLOYMENT.md | Moldova deploy | active | accurate | keep | operations |
| docs/setup/SETUP.md | Platform setup | active | accurate | keep | engineering |
| docs/sentry/SETUP.md | Sentry step-by-step | active | accurate | merge → core | operations |
| docs/sentry/LAUNCH_CHECKLIST.md | Sentry launch | active | accurate | merge → core | operations |
| docs/popular-brands-sync.md | Script doc (shared) | active | accurate | move → core | reference/scripts |
| assets/README.md | Assets structure (shared) | active | accurate | merge → core | reference |
| core/README.md | Core submodule nav | active | accurate | update | core root |
| core/docs/README.md | Core docs nav | active | accurate | update | architecture |
| core/docs/architecture/*.md | Architecture | active | partial | update/rename | architecture |
| core/docs/guides/*.md | Guides | active | partial | update/rename | engineering/operations |
| core/docs/features/*.md | Feature docs | active | partial | update/rename | domains |
| core/docs/scripts/*.md | Scripts | active | accurate | update/rename | reference |
| core/docs/analytics/*.md | Analytics | active | accurate | update/rename | reference |
| core/docs/audits/*.md | Audits | active | accurate | update/rename | reference |
| core/docs/LINTING.md | Linting | active | accurate | move | engineering |
| core/docs/features/TODO.md | Project TODO | active | accurate | consolidate | master TODO |
| core/backend/docs/*.md | Backend docs | active | accurate | update/rename | engineering |
| core/frontend/docs/*.md | Frontend docs | active | accurate | update/rename | engineering |
| core/frontend/config/README.md | Config | active | accurate | keep | engineering |

### 1.2 Cursor rules (`.cursor/rules/*.mdc`)

- testing-linting.mdc, project-specific.mdc, no-comments.mdc, release-check-failures.mdc, backend-architecture.mdc, documentation.mdc, build-process.mdc, tests-english.mdc, architecture.mdc, slugs-diacritics.mdc, translations.mdc, notifications.mdc, pre-release-hygiene.mdc, agents-parallel.mdc, code-style.mdc, brands-models.mdc

**Action:** Refactor in Phase 5 (doc-first, section choice, README nav, Obsidian boundary).

### 1.3 Cursor commands (`.cursor/commands/*.md`)

- feature-review.md, docs-update.md, release-check.md, telegram-update-post.md, parallel-tasks.md

**Action:** Refactor in Phase 5 (template, README update, domain placement).

### 1.4 Skills (`.cursor/skills/*/SKILL.md`)

- legal-update-kupito, parallel-executors, platform-docs-sync, feature-review-kupito

**Action:** Keep; ensure they reference new doc paths after migration.

## 2. Naming violations

- UPPER_SNAKE_CASE in core: ARCHITECTURE_OVERVIEW.md, KNOWN_ISSUES.md, TECHNICAL.md, PLATFORM_CHECKLIST.md, SENTRY.md, etc. → rename to kebab-case.
- No `notes.md` / `temp.md` / `new-doc.md` in inventory (good).

## 3. Source-of-truth matrix

| Topic | Current SOT | After migration |
|-------|------------|-----------------|
| Sentry setup | docs/sentry/SETUP.md + core/docs/guides/SENTRY.md | core/docs/operations/sentry-setup.md (+ platform env in root) |
| Popular brands script | docs/popular-brands-sync.md | core/docs/reference/popular-brands-sync.md |
| Platform assets | assets/README.md + PLATFORM_CHECKLIST | core/docs/reference/platform-assets.md |
| Deployment | core/docs/guides/DEPLOYMENT.md (generic) + docs/deployment/PRODUCTION_DEPLOYMENT.md (Moldova) | Unchanged split |
| Platform setup | docs/setup/SETUP.md | Root docs/setup only |

## 4. Gap analysis

- **Missing:** docs/engineering/documentation-standards.md (format, headings, tags).
- **Missing:** docs/engineering/obsidian-usage.md (repo vs vault, tags, MOC).
- **Missing:** Single master TODO document; reference from features/TODO and elsewhere.
- **Missing:** ADR index and initial ADRs (e.g. doc structure decision).
- **Missing:** Tag taxonomy document (type/*, domain/*, status/*, ops/*).

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

Required minimum per doc: one type/*, one scope/* (core or platform), status/active or status/draft.
