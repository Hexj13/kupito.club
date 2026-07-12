# Playwright e2e: run and fix

1. **Run Playwright e2e** from frontend:
   ```bash
   cd core/frontend
   npm run test:e2e
   ```

2. **Analyze failures**:
   - Review failed step, assertion, and locator details.
   - Open Allure results and generated report (`allure-results`, `allure-report`) plus Playwright trace/screenshots/video for failing tests.

3. **Fix issues in priority order**:
   - **Selectors**: prefer stable `data-testid` locators used by e2e specs.
   - **Flow stability**: remove flaky waits, use explicit assertions and navigation checks.
   - **Test data**: ensure test account and listing data match scenario preconditions.
   - **Regression safety**: keep existing app behavior, avoid test-only logic in business code.

4. **Re-run until green**:
   ```bash
   cd core/frontend
   npm run test:e2e:allure
   npm run test:e2e:allure:open
   ```

Do not skip failed tests. Stabilize and pass the full e2e suite.
