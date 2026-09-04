# Documentation update: sync with changes and fix inconsistencies

Update internal documentation and legal (footer) content to match current uncommitted changes and fix any doc/implementation mismatches. Keep docs laconic, clear, well-formatted, and factual—no fluff.

**Doc placement:** Prefer updating existing docs; when creating new, use the right section (architecture, domains/features, engineering, operations, reference, prompts) and the template for that type (see core/docs/templates/). Update the section README. Do not create duplicate docs for the same topic.

## 1. Gather current changes

From repo root:

```bash
git status
git diff
git diff --staged
git log origin/main..HEAD --oneline
```

Identify: modified/added/deleted files in `core/`, root `config/`, `locales/`, `docs/`, and any new features or API changes.

## 2. Internal documentation (update if needed)

**Locations:**

- **Core:** `core/docs/` (README.md, documentation-architecture.md, architecture/, guides/, features/, reference/, operations/, engineering/, analytics/, scripts/, audits/)
- **Root:** `docs/` (setup/, deployment/, sentry/ — platform-only)
- **Backend:** `core/backend/docs/` (testing.md, scripts.md, README.md)
- **Frontend:** `core/frontend/docs/` (README.md, storybook.md, design-system.md)

**Rules:**

- If code or config changed in a way that affects behavior, flows, or setup: update the relevant doc (or add a short section).
- If a new feature or script was added: add or update a file under `core/docs/features/` or the right section; add a line to `core/docs/README.md` in the features list if applicable.
- If architecture or scripts changed: update `core/docs/architecture/` or `core/docs/scripts/` and `core/docs/README.md` links/roadmap if needed.
- Style: short sentences, bullet lists where useful, no marketing speak. Only facts that help developers or operators.

## 3. Legal documents (footer: Terms & Privacy)

**Source of truth:** `config/legal.ts` (platform root). Rendered on `/terms` and `/privacy`; linked in footer.

**When to update:**

- New data collected or processed (e.g. new form fields, analytics, third-party services).
- New features that affect user obligations or platform rights (e.g. new listing rules, promotion, moderation).
- Changes in retention, storage, or sharing of personal data.
- New subprocessors or integrations (SMS, email, storage, analytics).

**How:** Edit the appropriate language block(s) in `config/legal.ts` (terms and/or privacy). Keep wording precise and minimal. After edits, run `npm run prepare:build` so the frontend gets the updated config.

## 4. Doc vs implementation consistency

While reviewing:

- Compare doc descriptions (APIs, env vars, scripts, flows) with actual code and config.
- If a doc says “X” but the code does “Y”, update the doc to “Y” (or fix the code if the doc is the intended spec).
- Remove or rewrite obsolete paragraphs; avoid “will be”, “planned” unless it’s a dedicated roadmap/plan section.

## 5. Output

- Only change files that need updates.
- Prefer small, targeted edits over large rewrites.
- Do not add comments inside code; do not duplicate long chunks from code into docs.
- Ensure lists and headings in `core/docs/README.md` stay consistent with the doc tree.

Summary for the user: what was updated (paths and brief reason) and what was checked but left unchanged.
