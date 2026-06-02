---
title: Production deployment (Moldova)
owner: platform
tags:
  - type/guide
  - domain/ops
  - scope/platform
  - status/active
---

# Production Deployment Instructions (Moldova)

> **📅 Created:** 2026-01-27  
> **📅 Updated:** 2026-01-27  
> **🎯 Purpose:** Instructions for setting up and maintaining production environment

## 🎯 Quick Summary

After deploying to production, perform the following actions:

1. **Update environment variables** in Render.com:
   - `NEXT_PUBLIC_COUNTRY=md` (in Backend and Frontend)
   - `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true` (in Backend and Frontend)
   - `COUNTRY=md` (in Backend, for scripts)

2. **Clear data** (if needed):
   - Delete all listings and users via script (recommended)
   - ⚠️ **WARNING:** This will delete ALL data!

3. **Assign administrator**:
   - After user registers, assign admin role
   - By email: `npm run make-admin:prod -- --email user@example.com`
   - By phone: `npm run make-admin:prod -- --phone +373XXXXXXXXX`

4. **Cities are already in code** - no generation required, available immediately after deploy
5. **Data generation NOT needed** on prod - data is created by real users

### 📝 How to Run Scripts in Render

**All scripts are run via Render Shell:**

1. Open **Render Dashboard** → Your Backend Service → **Shell**
2. Navigate to directory: `cd core/backend`
3. Run the needed script: `npm run <command>`

**Example:**
```bash
cd core/backend
npm run clear-listings-and-users:prod
```

**✅ Advantages of using scripts:**
- Automatic DB connection (uses environment variables)
- Security (no need to know DB password)
- Convenience (all in one place)
- Logging (visible what's happening)

---

## 📋 Contents

1. [Preparing for Deploy](#preparing-for-deploy)
2. [Clearing Data on Prod](#clearing-data-on-prod)
3. [Assigning Administrator](#assigning-administrator)
4. [Cities](#cities)
5. [Data Generation](#data-generation)
6. [Post-Deploy Verification](#post-deploy-verification)

---

## 🚀 Preparing for Deploy

### 1.0. Deploy Flow (CI → Render Hooks)

Deploys are gated by CI. The root workflow [.github/workflows/ci.yml](../../.github/workflows/ci.yml) runs `prepare`, then `frontend-check` and `backend-check` in parallel (`frontend-check` includes ESLint, Prettier, `typecheck`, `knip`, unit tests, and build). `audit` runs `npm audit` at **critical** level (blocking). Optional jobs when repository variables are set: `frontend-lighthouse` (`vars.LIGHTHOUSE_URL`), `frontend-e2e-p0` (`vars.PLAYWRIGHT_BASE_URL`, mobile `@p0` smoke with `PLAYWRIGHT_SKIP_WEBSERVER=1`). The `deploy` job (only on `push: main`, after required checks) triggers Render Deploy Hooks:

- `RENDER_FRONTEND_DEPLOY_HOOK` — frontend service webhook URL
- `RENDER_BACKEND_DEPLOY_HOOK` — backend service webhook URL

Both are GitHub repository secrets (Repository Settings → Secrets and variables → Actions). If a secret is missing, the corresponding deploy step is skipped — in that case Render's own auto-deploy on `push: main` still triggers (fallback).

**Recommended configuration:** to avoid double-deploys, turn off Render's "Auto-Deploy" on the service and rely on the CI-driven webhook. This way a red CI blocks production — you never ship a main that failed lint/test/build.

Branch protection for `main` (required checks, no force-push) is documented in [branch-protection.md](branch-protection.md).

#### Render service Build Commands (single source of truth)

Both Render services use `npm run prepare:build` — no ad-hoc `cp -r` steps. The script syncs platform files into the core submodule (`locales`, `theme`, `config`, assets, watermark) and rewrites the `legal.ts` import path for the core layout.

> ⚠️ Render pastes the Build Command verbatim into `bash -c`. Do **not** use backslash line-continuations (`\ `) — enter each command as a **single line**.

**Frontend service — Build Command (one line):**

```bash
git config --global credential.helper store && echo "https://x-access-token:${GITHUB_PAT}@github.com" > ~/.git-credentials && git submodule update --init --recursive && npm ci && npm run prepare:build && cd core/frontend && npm ci && npm run build
```

**Frontend service — Start Command:**

```bash
cd core/frontend && npm start
```

**Backend service — Build Command (one line):**

```bash
git config --global credential.helper store && echo "https://x-access-token:${GITHUB_PAT}@github.com" > ~/.git-credentials && git submodule update --init --recursive && npm ci && npm run prepare:build && cd core/backend && ONNXRUNTIME_NODE_INSTALL=skip npm ci && npm run build
```

`ONNXRUNTIME_NODE_INSTALL=skip` avoids `onnxruntime-node` postinstall downloading optional GPU binaries from NuGet (plate masking uses CPU only). CI sets the same via workflow `env`; Render has no default — without it, `npm ci` can fail with `ETIMEDOUT` to `api.nuget.org`.

**Backend service — Start Command:**

```bash
cd core/backend && npm run migration:run:prod && npm run start:prod
```

Run migrations before `start:prod` on every deploy so schema and code stay aligned. **Recommended:** configure Render **Pre-Deploy Command** as `cd core/backend && npm run migration:run:prod` and keep the start command as `cd core/backend && npm run start:prod` only, so migrations do not race with rolling restarts.

Requirements:

- Render service must use Node.js **≥ 22** (the repo pins `24` via `.nvmrc`). The `write-theme-json.js` step uses `node --experimental-strip-types` to load `lib/theme.ts` without `ts-node`, so there is no runtime TS dependency in production.
- Frontend service's `prebuild` (`core/frontend/package.json`) also runs `sync-platform-to-core.cjs` + `write-theme-json.js` as a safety net — so a bare `cd core/frontend && npm run build` is self-sufficient if the submodule is already checked out. The canonical Build Command above still runs `npm run prepare:build` at the root once, which matches CI.
- Do **not** add manual `cp -r locales core/frontend/lib/`, `cp -r theme core/frontend/lib/`, `cp -r config core/frontend/lib/`. They duplicate the sync script but skip the import rewrite in `lib/config/legal.ts` and silently break TypeScript compilation.

See also: [TECHNICAL.md §13.4.1 / §13.4.2](../../core/docs/architecture/TECHNICAL.md) — full Render configuration reference.

### 1.1. Updating Environment Variables in Render.com

**Backend Service (Render.com):**
- Production requires `JWT_SECRET` (min 16 chars), `CRON_SECRET`, `DB_PASSWORD`, `REDIS_HOST`, and `REDIS_PORT`. Do not set `ALLOW_SMS_TEST_CODE` or `DB_SYNC=true` in production.
- Prometheus or internal scrapers for `GET /metrics` must send header `x-cron-secret: <CRON_SECRET>` (endpoint is protected by `CronSecretGuard`).
- Set `ONNXRUNTIME_NODE_INSTALL=skip` (or keep it in the Build Command as above; required so `onnxruntime-node` does not download GPU packages from NuGet during `npm ci`)
- Set `NEXT_PUBLIC_COUNTRY=md`
- Set `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- Set `COUNTRY=md` (for scripts)
- Optional listing AI analysis: set `GEMINI_API_KEY`; optionally set `GEMINI_MODEL`, `GEMINI_MODEL_FALLBACK`, and `AI_REPORT_MAX_GENERATIONS_PER_HOUR` (default production quota is 5 new generations per user per hour)

**Frontend Service (Render.com):**
- Set `NEXT_PUBLIC_COUNTRY=md`
- Set `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- **TWA / Digital Asset Links (before Play release):** set `MOBILE_APP_SHA256_FINGERPRINTS` to the Play App Signing SHA-256 (comma-separated if multiple). Optional `MOBILE_APP_PACKAGE_NAME` (`club.kupito.app`). Run `npm run mobile:assetlinks` locally to generate `assets/frontend/public/.well-known/assetlinks.json`, then `npm run prepare:build` before deploy, or rely on the dynamic `/.well-known/assetlinks.json` route when env vars are set.

**Transactional email (optional):** To send verification and security emails from the API, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and (recommended) `SMTP_FROM` and `FRONTEND_URL` on the **backend** service. See the core runbook [smtp-email-setup.md](../../core/docs/operations/smtp-email-setup.md) ([RU](../../core/docs/operations/smtp-email-setup-ru.md)) — local development, Render, Google Workspace.

**Post-deploy checklist (web + TWA):**
1. Run `cd core/backend && npm run migration:run:prod` after backend deploy.
2. Verify `GET https://<domain>/.well-known/assetlinks.json` returns HTTP 200 and non-empty JSON before Play/TWA release.
3. Set `MOBILE_APP_SHA256_FINGERPRINTS` on frontend (or commit generated `assetlinks.json` via `npm run mobile:assetlinks` + `npm run prepare:build`).
4. Enable `mobileApp.enabled` in platform `config/site.ts` only after Play listing is live.

### 1.2. Database Verification

Ensure that:
- Migrations are applied (via Render Shell: `cd core/backend && npm run migration:run:prod` after a successful `npm run build`)
- Database is accessible
- DB connection environment variables are configured

**How to run migrations in Render:**

1. **Open Render Dashboard** → Your Backend Service → **Shell**
2. **Execute command:**
   ```bash
   cd core/backend
   npm run migration:run:prod
   ```

---

## 🗑️ Clearing Data on Prod

### 2.1. Deleting All Listings and Users

**⚠️ WARNING:** This operation will delete ALL listings and ALL users from the database. Execute only after complete deploy and system functionality verification.

#### ✅ Option 1: Via Script (RECOMMENDED)

**This is the simplest and safest way!**

Production cleanup script is already created and available. Run via Render Shell:

1. **Open Render Dashboard** → Your Backend Service → **Shell**
2. **Execute command:**
   ```bash
   cd core/backend
   npm run clear-listings-and-users:prod
   ```

Script automatically:
- ✅ Connects to database (uses Render environment variables)
- ✅ Deletes all listings, users and related data
- ✅ Shows deletion statistics
- ✅ Performs verification after cleanup

**⚠️ WARNING:** This script will delete ALL listings and ALL users from the database. Execute only after complete deploy and system functionality verification.

#### Option 2: Via SQL (alternative method)

If for some reason you need to execute SQL directly:

**How to connect to DB in Render:**

1. **Via Render Dashboard:**
   - Render Dashboard → Your PostgreSQL Database → **Info**
   - Find **External Database URL** or use separate parameters:
     - Host
     - Port (usually 5432)
     - Database name
     - Username
     - Password

2. **Connect via psql (locally):**
   ```bash
   psql "postgresql://username:password@host:port/database"
   ```

3. **Or via any PostgreSQL client:**
   - Use External Database URL from Render
   - Or use connection parameters separately

**SQL commands for cleanup:**

```sql
-- Delete promotion history
DELETE FROM promotion_history;

-- Delete listing views
DELETE FROM listing_views;

-- Delete favorites
DELETE FROM favorites;

-- Delete saved filters
DELETE FROM saved_filters;

-- Delete listings
DELETE FROM listings;

-- Delete vehicles
DELETE FROM vehicles;

-- Delete phone verification codes
DELETE FROM phone_verification_codes;

-- Delete users
DELETE FROM users;
```

**Execution order is important** - dependent data is deleted first, then main tables.

**⚠️ Recommendation:** Use the script (Option 1) - it's safer and simpler!

### 2.2. Verification After Cleanup

Script automatically outputs statistics after cleanup. You can also verify manually:

**Via Render Shell (recommended):**

Create a simple verification script or use SQL:

```sql
SELECT COUNT(*) FROM listings;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM vehicles;
```

All queries should return `0`.

**Or via Render Dashboard:**
- Render Dashboard → Your PostgreSQL Database → **Connect** → **psql**
- Execute SQL queries above

### 2.3. Clearing persisted listing AI analyses only

To drop all persisted listing AI analysis rows (table `listing_ai_reports`) and reset in-flight locks and hourly generation quotas in Redis—without deleting listings or users—use:

**Via Render Shell:**

1. **Open Render Dashboard** → Your Backend Service → **Shell**
2. **Execute command:**
   ```bash
   cd core/backend
   npm run clear-listing-ai-reports:prod
   ```

Use this when prompt rules or output format change and you want users to receive freshly generated AI analyses on the next request.

---

## 👑 Assigning Administrator

### 3.1. Assigning Admin by Email

After user registers, assign admin role:

**Via Render Shell:**

1. **Open Render Dashboard** → Your Backend Service → **Shell**
2. **Execute command:**
   ```bash
   cd core/backend
   npm run make-admin:prod -- --email user@example.com
   ```

If you also need to update password:

```bash
npm run make-admin:prod -- --email user@example.com --update-password --password newpassword123
```

### 3.2. Assigning Admin by Phone

If user registered only with phone (without email), you can assign admin by phone:

**Via Render Shell:**

1. **Open Render Dashboard** → Your Backend Service → **Shell**
2. **Execute command:**
   ```bash
   cd core/backend
   npm run make-admin:prod -- --phone +373XXXXXXXXX
   ```

**Note:** Script first searches user by email (if specified), then by phone (if specified). If user is found by phone, admin role will be assigned.

**Important:** When creating a new user via script, email is required. If you only need to assign admin to existing user, you can use only phone.

### 3.3. Verifying Admin Assignment

Verify that user became admin:

```sql
SELECT id, email, phone, first_name, last_name, type, active 
FROM users 
WHERE type = 'Admin';
```

---

## 🏙️ Cities

### 4.1. When Will Cities Be Available?

**✅ Cities are available immediately after deploy!**

Cities are stored **directly in code** in file `core/backend/src/cities/cities.service.ts` and **do NOT require generation or loading into database**.

**How it works:**
- Cities are hardcoded in service as array of objects
- On first request they are cached in Redis
- Available via API endpoint `/api/cities`
- Do not require migrations or seed scripts

**Cities for Moldova are already added to code:**
- All cities from configuration `platforms/md/config.ts` are already in `cities.service.ts`
- Include Romanian names (`name`), English (`nameEn`) and Russian (`nameRu`)
- Total ~90 cities in Moldova

### 4.2. Problem: Wrong Cities Displayed

**If wrong cities are displayed on production:**

1. **Check environment variables:**
   - Ensure `COUNTRY=md` is set in Backend Service
   - Ensure `NEXT_PUBLIC_COUNTRY=md` is set in Backend and Frontend Services

2. **Clear cities cache in Redis:**
   
   **Option 1: Via Render Shell (RECOMMENDED)**
   
   Open Render Dashboard → Backend Service → **Shell** and execute:
   ```bash
   cd core/backend
   npm run clear-cache:prod
   ```
   
   **Option 2: Via Redis CLI (if you have access)**
   
   Connect to Redis and execute:
   ```bash
   redis-cli
   KEYS cache:cities:*
   DEL cache:cities:all
   ```
   
   Or delete all keys with prefix:
   ```bash
   redis-cli --scan --pattern "cache:cities:*" | xargs redis-cli DEL
   ```

3. **Restart Backend Service:**
   - After clearing cache, restart Backend Service in Render Dashboard
   - This ensures service reloads cities from code with correct `COUNTRY=md` variable

**Verification:**
After deploy and cache clearing, you can verify cities availability:
```bash
curl https://api.kupito.club/api/cities
```

Should return Moldova cities (Chișinău, Bălți, Tiraspol, etc.).

---

## 🌱 Data Generation

### 5.1. Is Data Generation Needed on Prod?

**❌ NO, data generation is NOT needed on prod.**

Generation scripts (`seed.ts`, `reset-and-seed.ts`) are intended **only for test/development environments** and create:
- Test users
- Test listings
- Test data

**On production, data should only be created by real users through the website interface.**

### 5.2. If Test Data Is Still Needed

If for some reason you need to create test data on prod (e.g., for demonstration):

1. **⚠️ WARNING:** This will create test data visible to all users
2. Ensure `COUNTRY=md` is set
3. Run generation script (only for stage environment):
   ```bash
   cd core/backend
   npm run seed
   ```

**Recommendation:** Better to create test data manually through website interface after assigning admin.

---

## ✅ Post-Deploy Verification

### 6.1. Environment Variables Verification

Ensure all environment variables are updated:
- `NEXT_PUBLIC_COUNTRY=md` (in Backend and Frontend)
- `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true` (in Backend and Frontend)
- `COUNTRY=md` (in Backend, for scripts)
- `DEFAULT_CURRENCY` (optional, in Backend) — default currency for new listings when not sent by client; should match platform `config/site.ts` `currency` (e.g. `EUR`)
- `FXRATESAPI_API_KEY` (optional, in Backend) — API key for [FXRatesAPI](https://fxratesapi.com) to fetch exchange rates for approximate price in default currency (e.g. MDL→EUR)
- Listing video (optional, Backend): MediaConvert + SNS webhook + related AWS variables — [listing-video-production-setup-ru.md](../../core/docs/guides/listing-video-production-setup-ru.md) (operators, Russian); API summary in [listings.md](../../core/docs/features/listings.md)

### 6.2. Website Operation Verification

- [ ] Website accessible at `https://kupito.club`
- [ ] API accessible at `https://api.kupito.club`
- [ ] Language switcher works (Romanian/Russian)
- [ ] Cities displayed correctly (Romanian names) - available immediately after deploy
- [ ] Cities API works: `GET /api/cities` returns Moldova cities list
- [ ] Currencies displayed correctly (EUR, MDL)
- [ ] Phone numbers normalized with `+373` prefix

### 6.3. Database Verification

- [ ] All listings deleted (if cleanup was performed)
- [ ] All users deleted (if cleanup was performed)
- [ ] Administrator assigned correctly
- [ ] Brands and models loaded (if needed, see [brands-models-master-plan.md](../../core/docs/reference/brands-models-master-plan.md))

### 6.4. Functionality Verification

- [ ] User registration works
- [ ] Listing creation works
- [ ] Listing search works
- [ ] Image upload works
- [ ] (If listing video is enabled) Video upload completes and playback works on a listing
- [ ] Admin panel accessible for administrator

---

## 📝 Execution Checklist

### Before Deploy:
- [ ] All code changes deployed
- [ ] Environment variables updated in Render.com (backend: `ONNXRUNTIME_NODE_INSTALL=skip` or equivalent in Build Command)
- [ ] Migrations applied to database

### After Deploy:
- [ ] Website accessible and working
- [ ] API accessible and working
- [ ] Environment variables verified

### Data Cleanup (if needed):
- [ ] All listings deleted
- [ ] All users deleted
- [ ] Related data cleared (favorites, views, filters)

### Admin Assignment:
- [ ] User registered
- [ ] Administrator assigned (by email or phone)
- [ ] Admin can log in
- [ ] Admin panel accessible

### Final Verification:
- [ ] All functions work correctly
- [ ] No errors in logs
- [ ] Users can register and create listings

---

## 🔗 Related Documents

- [Branch Protection for main](branch-protection.md)
- [Scripts Documentation](../../core/backend/docs/scripts.md)
- [Brands and Models (Master Plan)](../../core/docs/reference/brands-models-master-plan.md)
- [Project Architecture](../../core/docs/architecture/technical.md)
- [Platform Setup](../setup/setup.md)
- [Listing video (production, RU)](../../core/docs/guides/listing-video-production-setup-ru.md) — AWS MediaConvert, SNS, Render env

---

## ⚠️ Important Notes

1. **Data cleanup:** Execute only after complete deploy and functionality verification
2. **Data generation:** NOT needed on prod - data is created by real users
3. **Brands and models generation:** If needed, use [brands-models-master-plan.md](../../core/docs/reference/brands-models-master-plan.md)
4. **Admin assignment:** Can be done immediately after user registration
5. **Environment variables:** Must verify in Render.com before deploy
6. **Backup:** Recommended to backup database before cleanup

---

## 📞 Support

If problems occur:
1. Check logs in Render.com
2. Check database logs
3. Check environment variables
4. Refer to project documentation
