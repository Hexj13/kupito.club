# Sentry Launch Checklist - Launch Readiness

## ✅ What's Already Configured

### Basic Monitoring
- ✅ **Errors** - automatic collection of JavaScript errors, unhandled rejections, API errors (>= 500)
- ✅ **Performance Tracing** - 10% traces on client, 100% on server
- ✅ **Session Replay** - recordings of all sessions with errors (100%), 10% of all sessions
- ✅ **Structured Logs** - enabled for all runtimes
- ✅ **Metrics** - enabled by default

### Cron Jobs Monitoring
- ✅ **auto-close-old-listings** - monitoring automatic closing of old listings
- ✅ **ip-block-cleanup** - IP block cleanup monitoring (every hour)
- ✅ **refresh-token-cleanup** - expired token cleanup monitoring (daily at 2:00)
- Endpoint `POST /listings/cron/close-old` available for external cron (no Sentry monitor; monitoring only via `auto-close-old-listings`)

### Business Metrics
- ✅ **users.registered** - registration counter (with attributes: user_type, has_email, has_phone)
- ✅ **listings.created** - listing creation counter (with attributes: status, currency, vehicle_type, is_promoted)
- ✅ **listings.searches** - search query counter (with attributes: has_filters, results_count, page, vehicle_type)

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
   - `ip-block-cleanup` (schedule: every hour)
   - `refresh-token-cleanup` (schedule: `0 2 * * *`)
   - (monitor `close-old-listings-endpoint` removed — only in-process cron is used)

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
2. **Performance** → **Transactions** - traces should appear
3. **Metrics** → verify metrics are arriving:
   - `users.registered`
   - `listings.created`
   - `listings.searches`
4. **Crons** → verify monitors are created and working

## 🎯 What to Monitor After Launch

### Critical Metrics to Monitor:

1. **Errors:**
   - Error rate (should be < 1% of requests)
   - Critical errors (500, unhandled exceptions)
   - Registration/listing creation errors

2. **Performance:**
   - API response time (should be < 500ms for 95% of requests)
   - Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)
   - Slow requests (> 1s)

3. **Business Metrics:**
   - `users.registered` - number of registrations
   - `listings.created` - number of created listings
   - `listings.searches` - number of search queries
   - Registration to search ratio

4. **Cron Jobs:**
   - Successful execution of all cron jobs
   - Execution time (should not exceed maxRuntime)
   - Missed executions (missed check-ins)

## 📊 Optimization Recommendations

### If Traffic is High:

1. **Lower sample rates:**
   - Client traces: already 10% (good)
   - Server traces: can lower to 0.1-0.2 if needed
   - Session Replay: can lower to 0.05 (5%)

2. **Configure dynamic sampling:**
   ```typescript
   tracesSampler: ({ name }) => {
     if (name.includes("health")) return 0.05;
     if (name.includes("/api/")) return 0.5;
     return 0.1;
   }
   ```

3. **Metric filtering:**
   - Use `beforeSendMetric` to filter unimportant metrics

### If Traffic is Low:

- Can increase sample rates for more detailed analysis
- Enable more session replays for UX analysis

## 🚨 Critical Issues to Watch For

1. **High error rate (> 5%)** - fix urgently
2. **Slow requests (> 2s)** - optimize
3. **Missed cron jobs** - check schedule and server availability
4. **Registration errors** - critical for business
5. **Listing creation errors** - critical for business

## 📝 Additional Improvements (can do later)

1. **Add more metrics:**
   - Listing views
   - Contact clicks
   - Conversions (registration after viewing)

2. **Add structured logs for key operations:**
   - Detailed logging of registration process
   - Logging of listing creation with full context

3. **Configure custom dashboards** in Sentry for metric visualization

## ✅ Final Checklist Before Launch

- [ ] All environment variables set in production
- [ ] Sentry Dashboard accessible and working
- [ ] Test events arriving in Sentry
- [ ] Monitors for cron jobs created (or will be created automatically)
- [ ] Alerts configured for critical errors
- [ ] Team knows where to look for metrics and errors
- [ ] Action plan exists for critical issues

---

**Ready to launch!** 🚀

All critical monitoring components are configured. After launching ads, you will receive a complete picture of application performance, errors, performance, and business metrics.
