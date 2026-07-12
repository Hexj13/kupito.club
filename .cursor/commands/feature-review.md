# Feature review: optimization and security

Analyze uncommitted/unpushed changes as the current "feature", apply optimization and security fixes, then run release-check and docs-update. Do not change behavior or product requirements; only improve quality, performance, and security.

**Final chat output is mandatory:** after all steps, post a **dev-ready, prompt-oriented** report using the template in §9. Every substantive finding (and every deferred item) must state **what is wrong or missing**, **what to improve**, **how to do it** (concrete steps, files, patterns), **why it matters**, and **what value** the change brings (risk reduced, speed, clarity, operability). Prefer imperative, copy-pasteable wording so another developer or agent can continue without re-reading the diff.

When reviewing, also explicitly cover **correctness** (logic, errors, edge cases), **i18n and copy**, and **code shape** (DRY / YAGNI / KISS). Prefer small, evidence-based fixes; if intent is unclear, note the risk instead of guessing product behavior.

## 1. Scope the feature

From repo root and, if needed, from `core/`:

```bash
git status
git diff
git diff --staged
git log origin/main..HEAD --oneline
```

List all modified/added files. Treat this set as the feature scope for §2–§6 (review) and the rest of the command.

## 2. Correctness: logic, errors, edge cases

Review the same scope for:

- **Business logic**: invariants, ordering of operations, idempotency where it matters, race or partial-failure windows, off-by-one and empty/null collections.
- **Error handling**: every failure path that can reach the user or logs has a defined outcome; no swallowed errors without reason; async boundaries (`try/catch`, promise rejections, stream errors) covered where new code introduces them.
- **Edge cases**: empty input, max size, timeouts, retries, stale data, missing optional fields, wrong types at runtime (parsed JSON, query params), concurrent updates.
- **Degradation**: what happens if a dependency (DB, cache, HTTP partner, disk) is slow or unavailable; sensible fallbacks or clear errors without leaking internals.

Apply fixes where behavior is clearly wrong or unsafe; otherwise document gaps in the summary. Do not broaden product scope to “handle everything” unless the existing requirement implies it.

## 3. Translations, keys, and user-visible text

Review the same scope for:

- **Keys**: new UI or API messages use stable keys; no dead keys left behind after renames; same key set across all languages for that layer (see `.cursor/rules/translations.mdc`).
- **Locations**: frontend strings in root `locales/{ro,ru,en}.json`; backend in `locales/backend/{ro,ru,en}.json` — not only copies under `core/` unless the pipeline already committed them intentionally.
- **Copy logic**: titles, labels, errors, and admin names stay consistent with domain terms elsewhere; no contradictory wording between frontend and backend for the same concept.
- **Interpolation and pluralization**: placeholders match arguments; edge strings (empty, very long) do not break layout or leak raw keys to users.

Fix missing or mismatched translations when the feature introduced them; confirm unchanged when no string surface changed.

## 4. Code quality: DRY, YAGNI, KISS

Review the same scope for:

- **DRY**: duplicated logic or constants that should be shared only when duplication is real maintenance risk; avoid premature abstraction.
- **YAGNI**: unused parameters, dead branches, speculative hooks or config not used by the feature.
- **KISS**: prefer straightforward control flow over clever patterns; reduce nesting and special cases where a single path is enough.
- **Consistency**: naming, module boundaries, and patterns match surrounding code; new utilities belong next to similar code unless a shared home already exists.

Refactor only when it removes real duplication, risk, or confusion — not for style alone.

## 5. Optimization analysis and fixes

Review the changed code and related call sites for:

- **Performance**: unnecessary work in hot paths, heavy computations without memoization, large list renders without virtualization where it matters, duplicate API/cache calls.
- **Bundle and runtime**: large or duplicate dependencies, dynamic imports where code-splitting would help, unused exports or dead code in the changed area.
- **Frontend**: unnecessary re-renders (missing `useMemo`/`useCallback`/React.memo where it’s justified), missing keys, inline object/array creation in props or deps, oversized or unoptimized assets.
- **Backend/API**: N+1 queries, missing indexes for new queries, missing or overly short cache TTL for data that doesn’t change often, redundant DB or external calls.
- **Data flow**: redundant state, missing loading/error boundaries, duplicate fetching.

Apply only changes that clearly improve behavior (e.g. measurable or obvious win). Prefer small, targeted edits. Do not refactor for style only; keep existing patterns unless they cause real issues.

## 6. Security analysis and fixes

Review the same scope for:

- **Input and output**: user input (forms, query params, body) validated and sanitized; no raw user content into HTML/DOM (XSS), SQL, or shell. Use parameterized queries and safe encoding.
- **Auth and access**: new endpoints or UI gated by correct auth/roles; no privilege escalation; tokens and secrets not logged or exposed in responses.
- **Sensitive data**: no passwords, tokens, or PII in logs, error messages, or client payloads beyond what’s required; no sensitive data in URLs or frontend storage unless necessary and documented.
- **Integrations**: external URLs (redirects, links) validated; no open redirects; partner/third-party usage consistent with Terms and Privacy.

Apply fixes for any real vulnerability or clear misuse. Do not change product behavior (e.g. required fields or business rules) unless they create a security issue.

## 7. Run release-check and e2e (Allure)

Execute the full release-check flow:

- From repo root: `npm run release-check`
- If any step fails (lint, format, tests, build): fix as per the release-check command, then re-run until it passes.
- After release-check is green, run frontend e2e with Allure:
  - `cd core/frontend && npm run test:e2e:allure`
  - `cd core/frontend && npm run test:e2e:allure:open`
- If e2e fails, fix test/data/flow instability and re-run until green.

## 8. Run docs-update

Execute the docs-update flow:

- Gather current changes again (step 1).
- Update internal docs (`core/docs/`, `docs/`, `core/backend/docs/`, `core/frontend/docs/`) if behavior or setup changed.
- Update `config/legal.ts` (Terms/Privacy) only if the feature affects data processing, user obligations, or subprocessors.
- Fix doc/implementation mismatches; keep docs laconic and factual.
- Optionally run `npm run prepare:build` after legal or config changes.

## 9. Final report to chat (required)

Post the report **in the same chat** after the command finishes. It must be **dev-ready** (specific paths, symbols, and acceptance checks) and **prompt-oriented** (structured so a human or another agent can act without re-deriving context from the diff).

### 9.1 Executive snapshot

- Feature scope: bullet list of paths / areas touched.
- Outcome: `release-check` green/red; e2e Allure green/red/skipped (if skipped, say why); docs-update done / nothing to update.
- Net change: N files edited in this run; link to themes (e.g. “one N+1 fixed”, “i18n keys added”).

### 9.2 Findings and actions (main body)

For **each** meaningful topic (correctness, i18n/copy, DRY/YAGNI/KISS, optimization, security, docs), use subsections. Inside each subsection, list **items** (numbered). Every item **must** include these five lines (use the labels literally for skim-search):

1. **What is wrong or missing** — observable fact, symptom, or gap (reference file:line or symbol when possible).
2. **What to improve** — desired end state or acceptance criterion (testable if applicable).
3. **How to do it** — concrete steps: which file/module, what change pattern, suggested test or command to verify.
4. **Why** — cause, risk, or standard violated (e.g. user sees 500, leak, N+1, missing translation key).
5. **Value** — what gets better: reliability, security, performance, maintainability, UX clarity, ops/debug time.

Mark each item with a status line: **`Fixed in this run`** (short note what changed) or **`Backlog`** (same five lines — still required — so the item stays actionable).

If there are **no** issues in a subsection, write one item: **What is wrong** — “None found in scope.” — and skip redundant detail or point to the checks that covered it.

### 9.3 Deferred / product-ambiguous

List items where behavior was **not** changed on purpose (unclear product intent, out of scope, or risk of requirement drift). Same five-line format; **Value** should say what decision is blocked on (e.g. PM, legal).

### 9.4 Continuation prompt (copy-paste block)

Close with a single fenced code block (use the `text` info string or leave it plain) containing:

- One short context paragraph: repo, branch if known, scope summary.
- Bullet list of **only** `Backlog` and **Deferred** items, each bullet still mini-structured: problem → action → verify → why it matters.

The goal: a developer or agent can paste that block into a new chat and continue work immediately.

---

Do not invent new features or requirements; only optimize, harden, and align docs and checks with the current implementation.
