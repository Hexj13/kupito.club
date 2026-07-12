# Release check: run and fix

**Reply to the user:** exit code, pass/fail per step, and concrete fixes only. Do not explain `prepare:build`, copied files under `core/`, or “source of truth” unless the user explicitly asks.

1. **Run release-check** from the repository root:

   ```bash
   npm run release-check
   ```

   This runs: `prepare:build`, then frontend (lint, lint:styles, format:check, test, build), then backend (lint:check, format:check, test, test:integration, build).

2. **Analyze the output**:
   - Note any failed step (ESLint, Stylelint, Prettier, Jest, Next.js build, Nest build).
   - Collect exact error messages, file paths, and line numbers.
   - Treat **warnings the same as errors**: if a step prints warnings (ESLint `warn`, Stylelint, test warnings, build warnings), fix them in code — do not leave them for “later” and do not dismiss them because the step exited 0.

3. **Fix issues** in order:
   - **Lint (ESLint)**: fix every reported **error and warning** in the listed files; run `npm run lint` (frontend) or `npm run lint:check` (backend) in the corresponding `core/frontend` or `core/backend` directory.
   - **Styles (Stylelint)**: fix CSS/SCSS issues in `core/frontend`; run `npm run lint:styles` there.
   - **Format (Prettier)**: run `npm run format` in `core/frontend` and `npm run format` in `core/backend` to auto-fix, or fix formatting manually to satisfy `format:check`.
   - **Tests**: fix failing tests (assertions, mocks, or code under test) in the reported spec/test files.
   - **Build**: fix TypeScript/runtime errors that break `npm run build` in frontend or backend.

   **Do not “fix” by ignoring:** no `eslint-disable`, no weakening rules, no `--max-warnings`, no skipping files/steps, no “acceptable warnings” unless the project already documents that exact case in `.cursor/rules/`.

4. **Optional** (only if the user asked for e2e in the same turn): after release-check is green, run Playwright e2e / Allure per `e2e-tests` command.

5. **Re-run release-check** after each batch of fixes until it passes with **no errors and no warnings** in any step output (or only cases explicitly documented in project rules).

6. `npm run release-check` already unsets `devdir` internally, so no extra wrapper is needed.

Do not skip any failing step. Do not stop while warnings remain unfixed. Fix all errors and all warnings per project rules (see `.cursor/rules/`).
