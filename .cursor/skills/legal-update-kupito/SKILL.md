---
name: legal-update-kupito
description: Reviews whether kupito.club legal texts must be updated after implementation changes and edits `config/legal.ts` when needed. Use when the user mentions terms, privacy, legal pages, footer legal links, personal data processing, partners, analytics, retention, or changes that may affect legal text.
---

# Legal Update Kupito

## Use this skill when

- The user asks about Terms, Privacy Policy, footer legal links, or legal text.
- A feature changes data collection, data processing, retention, third-party services, redirects, partner integrations, or user obligations.
- The task is to check whether `config/legal.ts` needs an update.

## Source of truth

- Legal pages are defined in `config/legal.ts` in the platform root.
- They are rendered on `/terms` and `/privacy`.
- Root `config/` is the source of truth; copied config in core is runtime output.

## Workflow

1. Inspect the implementation change.
- Look for new forms, fields, analytics, storage, third-party APIs, redirects, partner flows, moderation rules, or retention changes.
- Check both platform root and `core/` if the feature spans both.

2. Decide whether legal text must change.
- Update Terms if the feature changes platform rules, user obligations, acceptable use, moderation, partner redirects, or platform rights.
- Update Privacy if the feature changes what data is collected, where it is stored, who receives it, retention, security measures, or subprocessors.
- Do not update legal text for internal refactors that do not affect user-facing legal reality.

3. Edit carefully.
- Keep wording factual, minimal, and precise.
- Update all relevant language blocks that exist in `config/legal.ts`.
- Keep terminology consistent across languages.

4. Sync build copies.
- After changing `config/legal.ts`, run `npm run prepare:build` so the updated config is copied into core runtime files.

5. Check related docs.
- If the legal change is caused by a documented feature, verify whether a related doc in `core/docs/` or `docs/` should also be updated.

## Project-specific reminders

- Partner flows and redirects may require both Terms and Privacy updates.
- If a feature introduces new translation keys elsewhere, update all required locale files in root.
- Do not edit generated copies in `core/frontend/lib/config/` directly.

## Output

Return a short summary with:
- whether legal text was required
- which sections changed and why
- whether `npm run prepare:build` was run
- related docs updated or confirmed unchanged

## References

- `.cursor/commands/docs-update.md`
- `.cursor/rules/architecture.mdc`
- `.cursor/rules/translations.mdc`
