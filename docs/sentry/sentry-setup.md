---
title: Sentry setup (Moldova)
owner: platform
tags:
  - type/guide
  - domain/ops
  - scope/platform
  - status/active
---

# Sentry Setup (Moldova / platform-specific)

Shared setup and reference: **[core/docs/guides/sentry.md](../../core/docs/guides/sentry.md)**. This doc: step-by-step and platform env (e.g. kupito-frontend, kupito-backend).

Structured payloads, `X-Request-Id` correlation, and sanitization rules: **[core/docs/guides/logging.md](../../core/docs/guides/logging.md)**.

Phone numbers, email addresses, auth headers, and SMS codes in Sentry events are redacted automatically via `beforeSend` (`sanitizeSentryEvent` on backend and frontend). See logging.md for file paths; do not rely on manual filtering alone.

## Step 1: Create Projects in Sentry

### Frontend Project

1. Go to https://sentry.io
2. Log in or create an account
3. Create a new project for frontend:
   - Click "Create Project"
   - Select platform: **Next.js**
   - Enter project name (e.g., `kupito-frontend`)
   - Click "Create Project"

### Backend Project

1. In the same Sentry account, create a second project:
   - Click "Create Project" (or go to Projects → Create Project)
   - Select platform: **Node.js**
   - Enter project name (e.g., `kupito-backend`)
   - When asked "Do you use a framework?" select **Nest.js** (not "Nope, Vanilla")
   - Click "Configure SDK" or "Create Project"

**Important:**

- Frontend and backend must be different projects since they are different platforms with different settings
- Selecting "Nest.js" will provide more accurate setup and automatic instrumentation for NestJS applications

## Step 2: Get DSN

1. After creating the project, you'll see a page with instructions
2. Find the **DSN** (Data Source Name) field
3. Copy the value (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. This value is for `NEXT_PUBLIC_SENTRY_DSN`

**Alternative method:**

- Settings → Projects → [your project] → Client Keys (DSN)
- Copy the DSN

## Step 3: Get Organization Name (SENTRY_ORG)

1. Look at the top left corner of the Sentry interface
2. There you'll see your organization name (slug)
3. Or go to: Settings → Organizations
4. This value is for `SENTRY_ORG`

**Example:** If URL looks like `https://sentry.io/organizations/my-org/...`, then `SENTRY_ORG=my-org`

## Step 4: Get Project Name (SENTRY_PROJECT)

1. This is the project name you entered during creation
2. Or look at the URL: `https://sentry.io/organizations/[ORG]/projects/[PROJECT]/`
3. This value is for `SENTRY_PROJECT`

**Example:** If you created project `kupito-frontend`, then `SENTRY_PROJECT=kupito-frontend`

## Step 5: Create Auth Token (SENTRY_AUTH_TOKEN)

1. Go to: **Settings → Developer Settings → Personal Tokens** (or **Organization Tokens**)
   - **Personal Tokens** — for personal use
   - **Organization Tokens** — for team use (recommended for deployment)
2. Click **"Create New Token"**
3. Enter token name (e.g., `kupito-frontend-deployment`)
4. Select permissions (scopes):
   - ✅ `project:releases` (for uploading source maps)
   - ✅ `org:read` (for reading organization info)
5. Click **"Create Token"**
6. **IMPORTANT:** Copy the token immediately! It's shown only once
7. This value is for `SENTRY_AUTH_TOKEN`

**Note:** Don't use "Custom Integrations" — that's for creating apps. For frontend, you need a simple Personal/Organization Token.

## Step 6: Add Environment Variables

### Frontend for Production (Render.com or other hosting)

**Important:** Sentry is configured to work **only in production**. It's disabled in development.

Add environment variables in Render.com (or wherever your frontend is hosted):

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=your-auth-token
NODE_ENV=production
```

**Example real values:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://bef3229c62ce8e2cdde11fb1e7d2abd3@o4510783132008448.ingest.de.sentry.io/4510783135744080
SENTRY_ORG=kupitoclub
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=sntrys_xxx...
NODE_ENV=production
```

**For local development (optional):**

If you want to test Sentry locally, add to `core/frontend/.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

But usually this isn't needed — Sentry only works in production on the server.

### Backend (environment variables on server)

Add environment variables for backend (in Render.com or wherever your backend is hosted):

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

**Important:**

- `SENTRY_DSN` — this is DSN from **Node.js** project (backend), not from Next.js project
- `NODE_ENV=production` — required, otherwise Sentry will be disabled on backend
- These must be **different DSNs** for frontend and backend

## Sentry File Structure

After setup, the project will have these files:

### Frontend (`core/frontend/`)

- `instrumentation-client.ts` - client-side Sentry initialization
- `sentry.server.config.ts` - server-side Sentry initialization
- `sentry.edge.config.ts` - edge runtime Sentry initialization
- `instrumentation.ts` - registration of server and edge configs
- `app/global-error.tsx` - global React error catching
- `app/error.tsx` - error catching via Error Boundary
- `app/sentry-test/page.tsx` - test page for Sentry verification

Client-side Sentry is production-only, keeps `sendDefaultPii` disabled, and masks text, inputs, and media in Session Replay.

### Backend (`core/backend/src/`)

- `common/sentry.config.ts` - Sentry initialization for NestJS
- `common/interceptors/sentry.interceptor.ts` - interceptor for request context
- `common/filters/http-exception.filter.ts` - sending errors to Sentry

## Verification

### Frontend

**Important:** Sentry only works in production (`NODE_ENV=production`).

After deploying to production:

1. Check in Sentry: Issues → errors should appear in `kupito-frontend` project
2. Check Performance → Transactions for frontend traces
3. Check Replays → Session Replay for error session recordings

**For testing in production:**

- Open site in production
- Create a test error (e.g., via `/sentry-test` if page is available)
- Check in Sentry: Issues → error should appear

### Backend

After adding variables and deploying:

1. Check in Sentry: Issues → errors should appear in `kupito-backend` project
2. Check Performance → Transactions for backend traces

## Configuration Details

- **Sentry is active only in production** - disabled in development
- **TracesSampleRate: 0.05** - 5% of traces on client, server, and edge (backend also drops `/health`)
- **ReplaysOnErrorSampleRate: 0.2** - 20% of sessions with errors are recorded
- **ReplaysSessionSampleRate: 0** - random sessions are not recorded
- **enableLogs: false** - Sentry logs are off (use app logging)
- **browserTracingIntegration** - navigation and fetch traces; Web Vitals INP/long-task spans are off
- **automaticVercelMonitors: false** - not used (app is not on Vercel crons)
- **Profiling and custom Sentry metrics** - off

## What's Tracked

### Frontend

- ✅ JavaScript client errors
- ✅ Unhandled promise rejections
- ✅ Errors from Error Boundary (`app/error.tsx`)
- ✅ Global React errors (`app/global-error.tsx`)
- ✅ Critical API errors (status >= 500)
- ✅ Performance Monitoring (5% of navigation and request traces)
- ✅ Session Replay on errors only (20% of error sessions)

### Backend

- ✅ Server errors (status >= 500)
- ✅ Unhandled exceptions
- ✅ Performance Monitoring (5% of HTTP request traces; health checks excluded)
- ✅ Request context (method, path, user)
- ✅ Cron Jobs Monitoring (periodic task monitoring)

## Performance Tracing

Sentry automatically instruments most operations for performance tracing.

### What's Automatically Tracked

**Client:**

- Page loads and navigation
- Fetch requests to own API

**Server:**

- API routes (`route.ts`)
- Server Components
- `getServerSideProps`

**Edge:**

- Middleware
- Edge API routes

### Server Actions (if used)

Server Actions require manual instrumentation. If project uses Server Actions, wrap them:

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

export async function myServerAction(formData: FormData) {
  return Sentry.withServerActionInstrumentation(
    "myServerAction",
    { headers: await headers() },
    async () => {
      // Your logic
    },
  );
}
```

### Custom Instrumentation

Use `startSpan` to measure business operations:

```typescript
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  return Sentry.startSpan(
    { name: "checkout.process", op: "checkout" },
    async () => {
      const cart = await Sentry.startSpan(
        { name: "checkout.validate_cart", op: "validation" },
        () => validateCart(request),
      );

      const payment = await Sentry.startSpan(
        { name: "checkout.process_payment", op: "payment" },
        () => processPayment(cart),
      );

      return Response.json({ orderId: payment.orderId });
    },
  );
}
```

### Adding Attributes to Traces

Add data to spans for filtering and debugging:

```typescript
Sentry.startSpan(
  {
    name: "order.process",
    op: "order",
    attributes: {
      "order.id": orderId,
      "order.value": cart.total,
      "order.item_count": cart.items.length,
    },
  },
  async () => {
    // Operation logic
  },
);
```

### Distributed Tracing

Traces are automatically propagated for:

- `fetch()` requests to own domain
- Server Actions (when using `withServerActionInstrumentation` with headers)

For external APIs, configure `tracePropagationTargets` in `instrumentation-client.ts`:

```typescript
Sentry.init({
  dsn,
  tracesSampleRate: 0.1,
  tracePropagationTargets: ["localhost", /^https:\/\/api\.yourcompany\.com/],
});
```

### Web Vitals

Page-load transactions may still include basic vitals. INP and long-task spans are disabled to save quota.

## Metrics and structured logs

Custom `Sentry.metrics.*` and `Sentry.logger.*` are **not used**. Keep them off so they do not consume the logs/metrics quota. Application logs stay in the existing logger.

## Cron Jobs Monitoring

Sentry allows monitoring periodic tasks (cron jobs) for alerts and metrics to help solve errors, detect timeouts, and prevent service failures.

**Requirements:** SDK version 7.51.1+ (installed version 10.37.0 ✅)

### Automatic Vercel Cron Jobs Monitoring

If the app used Vercel Cron Jobs, Sentry could instrument them via `automaticVercelMonitors`. This project keeps that flag **false**.

**Note:** Automatic Vercel cron jobs instrumentation only works for Pages Router. App Router route handlers are not yet supported.

### NestJS Cron Jobs Monitoring

Project uses NestJS cron jobs via `@nestjs/schedule`. For monitoring, use `Sentry.withMonitor()`:

```typescript
import * as Sentry from "@sentry/node";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ListingsService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseOldListings(): Promise<{ closed: number }> {
    return Sentry.withMonitor(
      "auto-close-old-listings",
      async () => {
        // Existing logic for closing listings
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        // ... rest of logic
      },
      {
        schedule: {
          type: "crontab",
          value: "0 0 * * *", // Every day at midnight
        },
        checkinMargin: 5, // 5 minutes grace period
        maxRuntime: 30, // Maximum runtime 30 minutes
      },
    );
  }
}
```

### Monitor Configuration

Available configuration options:

- **`schedule`** - task schedule:
  - `{ type: "crontab", value: "0 * * * *" }` - cron expression
  - `{ type: "interval", value: "2", unit: "hour" }` - interval
- **`checkinMargin`** - check-in wait time in minutes before marking as "missed" (optional)
- **`maxRuntime`** - maximum runtime in minutes (optional)
- **`timezone`** - timezone (e.g., `"America/Los_Angeles"`) (optional)
- **`failureIssueThreshold`** - number of consecutive failed check-ins to create issue (SDK 8.7.0+, optional)
- **`recoveryThreshold`** - number of consecutive successful check-ins to resolve issue (SDK 8.7.0+, optional)

### Existing Cron Jobs in Project

Project uses these cron jobs with Sentry monitors:

1. **`auto-close-old-listings`** — closing old listings (`0 0 * * *`)
2. **`refresh-token-cleanup`** — expired refresh tokens (`0 2 * * *`)
3. **`exchange-rates-fetch`** — daily FX rates (`30 2 * * *`)
4. **`listing-views-retention`** — listing view retention (`0 3 * * *`)
5. **`parser-log-retention`** — parser log retention (`0 3 * * *`)
6. **`admin-audit-log-retention`** — admin audit log retention (`0 4 * * *`)

IP blocks are stored in Redis with TTL and do not need a cleanup cron.

## Useful Links

- [Sentry Dashboard](https://sentry.io)
- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Manual Setup Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Logs Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [Crons Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/crons/)
