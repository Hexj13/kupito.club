# Playwright e2e: run and fix

Multi-platform suite in PPCSL (`core/frontend/e2e`). Run from the **platform** repo after `prepare:build`, with `COUNTRY` / `NEXT_PUBLIC_COUNTRY` matching the platform (`md` for kupito, `al` for MakinaGuru).

1. **Install browsers once** (if missing):
   ```bash
   cd core/frontend
   npx playwright install chromium
   ```

2. **Run Playwright e2e** from frontend:
   ```bash
   cd core/frontend
   PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
   ```
   (Omit `PLAYWRIGHT_SKIP_WEBSERVER` if you want Playwright to start `npm run dev`.)

3. **Analyze failures**:
   - Review failed step, assertion, and locator details.
   - Open Allure results and generated report (`allure-results`, `allure-report`) plus Playwright trace/screenshots/video for failing tests.
   - Confirm failures are not locale/phone hardcodes — use `e2e/platform/contract.ts`.

4. **Fix issues in priority order**:
   - **Selectors**: prefer stable `data-testid` locators used by e2e specs.
   - **Flow stability**: remove flaky waits, use explicit assertions and navigation checks.
   - **Test data**: ensure test account and listing data match scenario preconditions.
   - **Platform values**: phones/locales/URL prefixes only via `getE2ePlatform()` / platform phone helpers.
   - **Regression safety**: keep existing app behavior, avoid test-only logic in business code.

5. **Re-run until green** (ideally on both platforms when changing shared e2e):
   ```bash
   cd core/frontend
   npm run test:e2e:allure
   npm run test:e2e:allure:open
   ```

Do not skip failed tests. Stabilize and pass the full e2e suite.
