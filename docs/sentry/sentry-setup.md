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

Shared setup and reference: **[core/docs/guides/SENTRY.md](../../core/docs/guides/SENTRY.md)**. This doc: step-by-step and platform env (e.g. kupito-frontend, kupito-backend).

Structured payloads, `X-Request-Id` correlation, and sanitization rules: **[core/docs/guides/logging.md](../../core/docs/guides/logging.md)**.

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
- **TracesSampleRate (Client): 0.1** - 10% of traces collected on client in production
- **TracesSampleRate (Server/Edge): 1.0** - 100% of traces collected on server (can lower with high traffic)
- **ReplaysOnErrorSampleRate: 1.0** - all sessions with errors are recorded
- **ReplaysSessionSampleRate: 0.1** - 10% of all sessions are recorded
- **enableLogs: true** - logging enabled
- **consoleLoggingIntegration** - automatic sending of console.error and console.warn
- **browserTracingIntegration** - automatic instrumentation of navigation, fetch requests and Web Vitals
- **Metrics** - enabled by default (SDK 10.37.0 supports metrics)
- **automaticVercelMonitors: true** - automatic monitoring of Vercel Cron Jobs (if using Vercel)

## What's Tracked

### Frontend

- ✅ JavaScript client errors
- ✅ Unhandled promise rejections
- ✅ Errors from Error Boundary (`app/error.tsx`)
- ✅ Global React errors (`app/global-error.tsx`)
- ✅ Critical API errors (status >= 500)
- ✅ Performance Monitoring (navigation and request traces)
  - Automatic instrumentation: page loads, navigations, fetch requests
  - Web Vitals: LCP, INP, CLS, FCP, TTFB
  - Distributed tracing for own API requests
- ✅ Session Replay (error session recordings)
- ✅ Structured Logs (logging via `Sentry.logger`)
- ✅ Console errors and warnings (via `consoleLoggingIntegration`)
- ✅ Metrics (counters, gauges, distributions)

### Backend

- ✅ Server errors (status >= 500)
- ✅ Unhandled exceptions
- ✅ Performance Monitoring (HTTP request traces)
  - Automatic instrumentation: API routes, Server Components
- ✅ Profiling (performance profiling)
- ✅ Request context (method, path, user)
- ✅ Structured Logs (logging via `Sentry.logger`)
- ✅ Metrics (counters, gauges, distributions)
- ✅ Cron Jobs Monitoring (periodic task monitoring)

## Performance Tracing

Sentry automatically instruments most operations for performance tracing.

### What's Automatically Tracked

**Client:**

- Page loads and navigation
- Fetch requests to own API
- Web Vitals (LCP, INP, CLS, FCP, TTFB)

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

SDK automatically tracks Web Vitals on each page load:

| Metric   | What it measures                            | Threshold (good) |
| -------- | ------------------------------------------- | ---------------- |
| **LCP**  | Largest Contentful Paint — load performance | ≤ 2.5s           |
| **INP**  | Interaction to Next Paint — responsiveness  | ≤ 200ms          |
| **CLS**  | Cumulative Layout Shift — visual stability  | ≤ 0.1            |
| **FCP**  | First Contentful Paint — initial render     | ≤ 1s             |
| **TTFB** | Time to First Byte — server response        | ≤ 100ms          |

Web Vitals are displayed as measurements on page load transactions and affect Performance Score in Sentry.

## Using Metrics

Sentry Metrics allows sending counters, gauges, and distributions from the application to Sentry. Metrics can be viewed alongside errors and filtered by attributes.

**Requirements:** SDK version 10.25.0+ (installed version 10.37.0 ✅)

### Metric Types

| Type           | Usage                                     |
| -------------- | ----------------------------------------- |
| `count`        | Events (orders, clicks, API calls)        |
| `gauge`        | Current values (queue depth, connections) |
| `distribution` | Value ranges (response time, data size)   |

### Basic Usage

```typescript
import * as Sentry from "@sentry/nextjs";

// Event counter
Sentry.metrics.count("orders_created", 1);

// Current value
Sentry.metrics.gauge("active_connections", 42);

// Value distribution
Sentry.metrics.distribution("api_latency", 187, {
  unit: "millisecond",
});
```

### Attributes for Filtering

Use attributes for filtering and grouping metrics:

```typescript
Sentry.metrics.count("api_calls", 1, {
  attributes: {
    endpoint: "/api/orders",
    user_tier: "pro",
    region: "us-west",
    user_id: user.id,
    order_id: order.id,
  },
});
```

**Important:** Each metric has a 2KB size limit. If exceeded, the metric will be dropped.

### Units

Specify units for `gauge` and `distribution`:

```typescript
Sentry.metrics.distribution("response_time", 187.5, {
  unit: "millisecond",
});

Sentry.metrics.gauge("memory_usage", 1024, {
  unit: "byte",
});
```

Available units: `millisecond`, `second`, `byte`, `kilobyte`, `megabyte`, and others.

## Using Structured Logs

Sentry supports structured logging for quick debugging.

### Basic Usage

```typescript
import * as Sentry from "@sentry/nextjs";

// Different log levels
Sentry.logger.trace("Entering function", { fn: "processOrder" });
Sentry.logger.debug("Cache lookup", { key: "user:123" });
Sentry.logger.info("Order created", { order_id: "order_456" });
Sentry.logger.warn("Rate limit approaching", { current: 95, max: 100 });
Sentry.logger.error("Payment failed", { reason: "card_declined" });
Sentry.logger.fatal("Database unavailable", { host: "primary" });
```

### Parameterized Messages

Use `fmt` for parameterized messages — values are extracted as searchable attributes:

```typescript
Sentry.logger.info(Sentry.logger.fmt`User ${userId} purchased ${productName}`);
```

## Cron Jobs Monitoring

Sentry allows monitoring periodic tasks (cron jobs) for alerts and metrics to help solve errors, detect timeouts, and prevent service failures.

**Requirements:** SDK version 7.51.1+ (installed version 10.37.0 ✅)

### Automatic Vercel Cron Jobs Monitoring

If app is hosted on Vercel and uses [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs), monitoring is already set up automatically via `automaticVercelMonitors: true` in `next.config.js`.

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

Project uses these cron jobs:

1. **`autoCloseOldListings`** - closing old listings (every day at midnight)
2. **IP Block cleanup** - clearing expired IP blocks (every hour)
3. **Refresh Token cleanup** - clearing expired refresh tokens (every day at 2:00)

All can be wrapped in `Sentry.withMonitor()` for monitoring.

## Useful Links

- [Sentry Dashboard](https://sentry.io)
- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Manual Setup Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Logs Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [Crons Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/crons/)
