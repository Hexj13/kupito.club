---
title: Sentry launch checklist (Moldova)
owner: platform
tags:
  - type/runbook
  - domain/ops
  - scope/platform
  - status/active
---

# Sentry Launch Checklist (Moldova)

Shared checklist: **[core/docs/operations/sentry-launch-checklist.md](../../core/docs/operations/sentry-launch-checklist.md)**. Below: platform-specific env and reminders.

## ✅ What's Already Configured

### Basic Monitoring
- ✅ **Errors** — JavaScript errors, unhandled rejections, API errors (>= 500)
- ✅ **Performance tracing** — 5% traces (health checks excluded)
- ✅ **Session Replay** — 20% of error sessions only; random sessions off
- ❌ **Sentry logs, profiling, custom metrics** — off (quota)

### Cron Jobs Monitoring
- ✅ **auto-close-old-listings** (`0 0 * * *`)
- ✅ **refresh-token-cleanup** (`0 2 * * *`)
- ✅ **exchange-rates-fetch** (`30 2 * * *`)
- ✅ **listing-views-retention** (`0 3 * * *`)
- ✅ **parser-log-retention** (`0 3 * * *`)
- ✅ **admin-audit-log-retention** (`0 4 * * *`)
- Endpoint `POST /listings/cron/close-old` available for external cron (no Sentry monitor)
- IP blocks use Redis TTL; there is no `ip-block-cleanup` job

## 📋 What to Do Before Launch

### 1. Environment Variables Check (CRITICAL)

Ensure all required variables are set in production:

**Frontend:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=kupitoclub
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=xxx
```

**Backend:**
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

### 2. Create Monitors in Sentry Dashboard

After first deploy, create monitors for cron jobs in Sentry:

1. Go to **Alerts** → **Crons** → **Create Monitor**
2. Create monitors for:
   - `auto-close-old-listings` (schedule: `0 0 * * *`)
   - `refresh-token-cleanup` (schedule: `0 2 * * *`)
   - `exchange-rates-fetch` (schedule: `30 2 * * *`)
   - `listing-views-retention` (schedule: `0 3 * * *`)
   - `parser-log-retention` (schedule: `0 3 * * *`)
   - `admin-audit-log-retention` (schedule: `0 4 * * *`)

Or they will be created automatically on first execution (if using `withMonitor` with config).

### 3. Configure Alerts (IMPORTANT)

Set up notifications for critical issues:

1. **Alerts** → **Create Alert**
2. Select "Issues" under "Errors"
3. Configure filters:
   - `The event's tags match monitor.slug equals auto-close-old-listings` - for cron jobs
   - `The event's level equals error` - for all errors
   - `The event's tags match httpStatus equals 500` - for server errors

4. Choose notification method (email, Slack, Discord, etc.)

### 4. Post-Deploy Verification

After deploying to production, verify:

1. **Sentry Dashboard** → **Issues** - test events should appear (if any)
2. **Crons** → verify monitors are created and working
3. **Performance** → a small sample of traces is enough; do not expect 100% coverage

## 🎯 What to Monitor After Launch

### Critical Metrics to Monitor:

1. **Errors:**
   - Error rate
   - Critical errors (500, unhandled exceptions)
   - Registration/listing creation errors

2. **Cron Jobs:**
   - Successful execution of live monitors
   - Missed executions (missed check-ins)

Keep traces at 5%, session replay off except 20% of error sessions, and do not add Sentry logs/metrics/profiling unless quota has clear headroom.

## 🚨 Critical Issues to Watch For

1. **High error rate (> 5%)** - fix urgently
2. **Slow requests (> 2s)** - optimize
3. **Missed cron jobs** - check schedule and server availability
4. **Registration errors** - critical for business
5. **Listing creation errors** - critical for business

## 📝 Additional Improvements (can do later)

Do not add extra Sentry metrics, logs, or session replay until error monitoring is stable and the spans quota has clear headroom.

## ✅ Final Checklist Before Launch

- [ ] All environment variables set in production
- [ ] Sentry Dashboard accessible and working
- [ ] Test events arriving in Sentry
- [ ] Monitors for cron jobs created (or will be created automatically)
- [ ] Alerts configured for critical errors
- [ ] Team knows where to look for errors and crons

---

**Ready to launch!** 🚀

All critical monitoring components are configured. After launching ads, you will receive a complete picture of application performance, errors, performance, and business metrics.
