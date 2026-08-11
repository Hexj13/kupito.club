---
title: 999md parser
owner: platform
tags:
  - type/feature
  - domain/parsing
  - scope/platform
  - status/active
---

# 999.md Partner Listings Import

## Purpose

`999md-import` migrates vehicle listings from `999.md` GraphQL into Kupito using the same downstream import pipeline as CipAuto (`ParsedPlpItem` / `ParsedPdpData`, upload client, payload mappers, Kupito API client).

The parser is sequential, restartable, and keeps a separate registry from CipAuto.

## PDP closure detection (GraphQL)

PDP batches use `advert(input: { id })` with fields including `state`, `isExpired`, `expire`, and `moderation { status }`. An advert is treated as **closed** when:

- GraphQL returns **no advert** (`null`) — close reason `graphql_advert_null`;
- **`isExpired` is true** (including when `state` is still `AD_STATE_PUBLIC`) — `graphql_is_expired`;
- **`state` is not `AD_STATE_PUBLIC`** for known non-public states (removed/blocked/need pay/hidden/draft/pre-moderation) — registry reasons `graphql_ad_state_*`.

That covers cases where the storefront HTML shows “listing not found” while GraphQL still returns an object (often expired).

## Location

Source of truth (core submodule):

- `core/backend/src/scripts/tools/999md-import/`

Shared import infrastructure (also in core):

- `core/backend/src/scripts/tools/partner-import-shared/`

Platform-level parser catalog (which parsers are enabled for this platform):

- `config/parsers.ts` in the platform root (copied into `core/frontend/lib/config/parsers.ts` and `core/backend/src/common/config/parsers.ts` by `prepare:build`)

## Commands

Run from repository root:

```bash
npm run prepare:build  # syncs platform-level config/parsers.ts into core
cd core/backend
npm run 999md:scan -- --login=AGMOTORS --env=local --page-size=50
npm run 999md:import -- --userId=<UUID> --status=paused --env=local --limit=5
npm run 999md:report -- --last --env=local
npm run 999md:seed-registry -- --login=AGMOTORS --userId=<UUID> --env=local --dry-run
npm run partner:check-urls -- --partner 999md --userId=<UUID> --env=local
```

From the **platform repo root** you can use the same wrapper as other `999md:*` scripts: `npm run 999md:seed-registry -- --login=... --userId=...`.

The shared script `partner:check-urls` (see below) is also run from `core/backend` after `cd core/backend`.

### `999md:scan` flags

- `--login` required profile login on 999.md
- `--page-size=<n>` (default `50`)
- `--max-items=<n>`
- `--dry-run`
- `--env=local|prod`
- `--delay=<ms>` (default `3000`)

After a successful PLP write, the registry is finalized against the new snapshot **for the scanned profile login only** (`profileLogin` on registry rows): items that disappear from that PLP are marked `missing_candidate` without touching other 999.md profiles in the same registry file (see shared `finalizeRegistryAfterPlpScan` with optional `shouldMarkMissing`). The PLP JSON written to `current-plp/<login>.json` includes `meta.missingCandidateSourceIds` and `meta.closeEstimateSourceIds` so a later **`999md:import --plp-file=... --remove-closed`** still selects those IDs for PDP checks even when they are no longer listed under `items`. Older PLP files without `meta.missingCandidateSourceIds` cannot reliably drive closure for listings that dropped off the PLP; re-run `999md:scan` or use **`--source-id`** for a one-off recovery. **Admin / scheduler PLP runs** do not pass resume or remove-closed into the scan CLI; use **`999md:import --remove-closed`** (and optional `--resume`) when you want PDP to close or re-process listings for removed or null GraphQL ads.

### `999md:import` flags

Same semantics as `cipauto:import`:

- `--userId` (required), `--status`, `--env`, `--limit`, `--resume`, `--dry-run`
- `--remove-closed` — when PDP marks the source closed (`sourceStatus: 'closed'`: GraphQL advert missing, expired, or non-public `state`), close the Kupito listing when allowed and update registry state
- `--only-failed`, `--update-existing`, `--source-id`, `--plp-file`
- `--registration-type`, `--default-hp`, `--city`, `--delay`
- `--check-user-duplicates-before-create` — before `createListing`, load the partner user’s vehicle rows from the DB and skip create when a duplicate is found, in order: **(1)** same user + `partner_source_code = 999md` + `partner_listing_external_key` = this ad id; **(2)** single unambiguous **VIN** match among that user’s vehicle listings; **(3)** exactly one **fingerprint** match (same fields/tolerances as `999md:seed-registry`). Tolerances: `--dedupe-999-price-tolerance-pct` (default `0`), `--dedupe-999-photo-count-tolerance` (default `1`). Requires PostgreSQL env from `core/backend` (same pattern as `seed-registry`). Ambiguous VIN or fingerprint → registry `manual_review` with `DUPLICATE_AMBIGUOUS:` in `error`. Registry state `duplicate_skipped` uses `error` prefix `DUPLICATE_MATCH:` plus layer (`partner_key`, `vin`, or `fingerprint`).
- `--auto-create-brands` / `--auto-create-models` — same semantics as `cipauto:import` (see [cipauto-import.md](./cipauto-import.md)): when the resolved brand or model is missing in our catalog, create it via the admin API (`POST /api/admin/brands` or `POST /api/admin/vehicle-models`) and continue importing in the same run. The import account must be **Admin**. HTTP 409 is treated as a race and resolved by re-fetching once. The CLI passes `vehicleType` to the resolver so a brand/model can be auto-created under the correct vehicle type.

**Admin UI:** **Admin → Parsing → PDP** — **Check duplicates before create**, **Auto-create missing brands**, and **Auto-create missing models** on manual runs and PDP schedules persist as `config_snapshot.checkUserDuplicatesBeforeCreate`, `autoCreateBrands`, `autoCreateModels`.

### `999md:report` flags

- `--last`
- `--file=<path>`
- `--env=local|prod`

### `999md:seed-registry` (registry recovery / dedup)

Use when the partner already has vehicle listings in Kupito but the **999.md parser registry** was lost or never aligned (e.g. ephemeral disk). Without seeding, a fresh `scan` + `import` would create duplicates.

The script:

1. Loads vehicle listings for `--userId` from the Kupito database (Active, Paused, Closed).
2. Fetches the 999.md profile PLP for `--login`, then PDP for each ad (sequential, with delay).
3. Matches each 999 ad to at most one listing: **VIN** first (single candidate among listings not yet consumed), else a **fingerprint** (resolved brand/model, mapped fuel and color, year, mileage, engine volume with tolerance, price + currency with optional tolerance, image count with tolerance).
4. Writes **`999md-registry.json`** (`upsert` with `kupitoListingId`, `state: created`, etc.) and updates **`listings.partner_source_code`**, **`partner_listing_external_key`**, and **`partner_listing_canonical_url`** (999 listing canonical URL) for matched rows (unless `--dry-run`).

Requires **PostgreSQL** (same env as the API DB), **Kupito import admin auth**, and 999 GraphQL env vars as for `scan`/`import`.

**Admin UI:** With `registrySyncEnabled` for 999.md, **Admin → Parsing → PLP files → Sync registry** on a login’s PLP snapshot row queues the same `999md:seed-registry` process as the CLI (`--login` is taken from the PLP JSON; partner UUID is required and may be prefilled from recent runs). Closing the modal does not cancel; use **Cancel** while the run is active.

**Admin UI (PDP):** **Manual PDP** and **new PDP schedules** call the same **`sync-hint`** after you pick a PLP file, prefilling the partner UUID and showing a login vs filename warning when applicable (hint read does not require `registrySyncEnabled`; **Sync registry** still does).

```bash
cd core/backend
npm run 999md:seed-registry -- --login=AGMOTORS --userId=<UUID> --env=local --dry-run
npm run 999md:seed-registry -- --login=AGMOTORS --userId=<UUID> --env=local
```

Flags:

- `--login` (required) — 999.md profile login
- `--userId` (required) — Kupito user UUID (partner) whose listings are matched
- `--env=local|prod`
- `--dry-run` — only write `reports/999md-seed-*.{json,csv}`; do not mutate registry or DB
- `--delay=<ms>` — pause between PDP fetches (default `2000`)
- `--price-tolerance-pct=<n>` — max price drift vs listing, percent of the higher of the two prices (default `0` = exact after rounding)
- `--photo-count-tolerance=<n>` — allowed difference between `min(999 images, 20)` and Kupito `images.length` (default `1`)

Reports land next to import reports: `reports/999md-seed-<timestamp>.json` and `.csv` under the 999.md runtime dir (see below).

**Database:** listings store the external 999 id under `partner_source_code = '999md'`, `partner_listing_external_key = <GraphQL ad id>`, and optional **`partner_listing_canonical_url`** (technical canonical PDP URL, not shown in the storefront UI). Apply backend migrations so these columns exist before relying on seed or import to persist them.

**API (admin only):** create and update listing payloads may include `partner_source_code` and `partner_listing_external_key` only together; **`partner_listing_canonical_url`** may be set only with that pair (https URL, validated server-side). Keys must be unique across listings. The 999 import CLI sets all three automatically on each successful create/update (and sends a narrow partner-metadata PATCH when import skips a full update because `--update-existing` is off).

### `partner:check-urls` (saved URL health check)

Shared script for **CipAuto** and **999.md**: loads vehicle listings for `--userId` that already have `partner_listing_canonical_url`, runs the same PDP parser as imports, and writes **`reports/partner-url-check-<partner>-*.{json,csv}`** under that parser’s runtime `reports/` directory (`cipauto` vs `999md` config).

```bash
cd core/backend
npm run partner:check-urls -- --partner 999md --userId=<UUID> [--env local|prod] [--dry-run] [--limit=<n>] [--delay=<ms>]
```

Flags: `--partner` `cipauto` or `999md` (required), `--userId` (required), `--env`, `--dry-run`, `--limit`, `--delay`. See `core/backend/docs/SCRIPTS.md` → **Partner listing URL check**.

Partner-imported listings set `listings.is_parsed = true`. The platform 90-day auto-close cron **skips** those rows; source-driven closure remains `--remove-closed`.

```bash
npm run partner:mark-parsed -- --partner=999md --userId=<UUID> --env=prod [--plp-file <path>] [--dry-run]
npm run partner:reopen-parsed -- --partner=999md --userId=<UUID> --env=prod [--dry-run]
```

### Dealer audit

```bash
npm run 999md:dealer-audit -- --login=AGMOTORS --kupitoApiUrl=http://localhost:4000 --out=docs/parsing/data/999md-audit.json
```

## Required env variables

Shared Kupito import auth:

- `KUPITO_IMPORT_ADMIN_EMAIL`
- `KUPITO_IMPORT_ADMIN_PASSWORD`

Optional Kupito overrides:

- `KUPITO_IMPORT_SECRET`
- `KUPITO_IMPORT_API_URL`
- `KUPITO_IMPORT_DEBUG=1`

Legacy aliases are still supported (`CIPAUTO_*` auth/api/secret/debug).

999.md source:

- `SITE999MD_GRAPHQL_URL` (default `https://999.md/graphql`)
- `SITE999MD_LISTING_URL_TEMPLATE`
- `SITE999MD_IMAGE_BASE_URL`
- `SITE999MD_REQUEST_TIMEOUT_MS`
- `SITE999MD_MAX_RETRIES`
- `SITE999MD_DEFAULT_DELAY_MS`
- `SITE999MD_IMAGE_DELAY_MS`
- `SITE999MD_ADVERT_BATCH_SIZE`
- `SITE999MD_DEBUG=1`

Admin parsing schedules use an HTTP availability probe for parser code `999md` (configured in `config/parsers.ts` as `availabilityProbe`): a single `GET` against the source base URL `https://999.md`.

## Runtime artifacts

Filesystem layout (registry + per-login PLP JSON + reports survive deploys only if this tree is on a **persistent volume**, e.g. Render Disk):

- `PARSING_RUNTIME_DIR` — optional; when unset, defaults to `core/backend/runtime/parsing` (relative to `cwd` when you run CLI from `core/backend`). On Render, set to your **disk mount path** (must match the backend service env if you use admin Parsing or schedules).
- Optional overrides: `SITE999MD_REGISTRY_PATH`, `SITE999MD_REPORTS_DIR` (absolute or relative to `cwd`).

Default paths under `<PARSING_RUNTIME_DIR or runtime/parsing>/999md/`:

- `999md-registry.json`
- `current-plp/<login>.json` — PLP snapshots per profile login
- `reports/999md-run-*.json` — import run summaries
- `reports/999md-seed-*.{json,csv}` — seed-registry outcomes (`matched_vin`, `matched_fingerprint`, `no_match`, `ambiguous`, etc.)
- `reports/partner-url-check-999md-*.{json,csv}` — optional output from `npm run partner:check-urls -- --partner 999md ...`

These files are runtime data, ignored by git, and must not be committed. Legacy paths under `src/scripts/tools/999md-import/data/` are not used by the CLI.

## Listing video (optional)

When PDP exposes a video URL, `999md:import` may request server-side ingest via the Kupito API (`POST /api/upload/video/from-url`) after the listing row exists. If ingest fails, the run logs a warning and continues. See `core/docs/features/listings.md`.

## Mapping highlights

- GraphQL subcategory is normalized to `car`, `truck`, or `moto`
- unresolved subcategory -> `manual_review` (`UNMAPPED_SUBCATEGORY`)
- brand/model resolution uses shared `BrandModelResolver` with `vehicleType`
- parser reuses shared enum/color/equipment/field mapping pipeline
- `availability`, `country_of_origin`, `owners_count`, `interior_color`, and `seats` are not on the 999.md advert payload (or not reliably extractable); import leaves them unset

## Tests

```bash
cd core/backend
npx jest src/scripts/tools/999md-import --no-cache
```

## Troubleshooting

- `401`: verify import credentials and admin role
- missing brand/model: sync platform catalog first
- source timeout/rate limits: increase delays
- interrupted runs: rerun with `--resume`
