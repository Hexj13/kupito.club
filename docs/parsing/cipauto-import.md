---
title: CipAuto parser
owner: platform
tags:
  - type/feature
  - domain/parsing
  - scope/platform
  - status/active
---

# CipAuto Partner Listings Import

Russian copy: [cipauto-import-ru.md](./cipauto-import-ru.md).

## Purpose

`cipauto-import` migrates vehicle listings from `cipauto.md` into Kupito through the backend API.

The parser is:

- idempotent (`sourceListingId` registry key)
- restartable (`--resume`)
- selective (`--only-failed`, `--source-id`, `--limit`)
- observable (structured logs + JSON reports)
- sequential (reduced source/API load)

## Location

Source of truth (core submodule):

- `core/backend/src/scripts/tools/cipauto-import/`

Shared import infrastructure (also in core):

- `core/backend/src/scripts/tools/partner-import-shared/`

Platform-level parser catalog (which parsers are enabled for this platform):

- `config/parsers.ts` in the platform root (copied into `core/frontend/lib/config/parsers.ts` and `core/backend/src/common/config/parsers.ts` by `prepare:build`)

## Commands

Run from repository root:

```bash
npm run prepare:build  # syncs platform-level config/parsers.ts into core
cd core/backend
npm run cipauto:scan -- --pages=24 --env=prod
npm run cipauto:import -- --userId=<UUID> --status=paused --env=prod --limit=10
npm run cipauto:report -- --last --env=prod
npm run partner:check-urls -- --partner cipauto --userId=<UUID> --env=prod
```

### `cipauto:scan` flags

- `--pages` required total pages
- `--page-from`, `--page-to` optional range
- `--resume`
- `--dry-run`
- `--env=local|prod`
- `--delay=<ms>`

### `cipauto:import` flags

- `--userId` required owner user UUID
- `--status=active|paused` (default `paused`)
- `--env=local|prod`
- `--limit=<n>`
- `--resume`
- `--dry-run`
- `--only-failed`
- `--update-existing`
- `--source-id=<sourceListingId>`
- `--registration-type=Local|Foreign|Cleared` (default `Cleared`)
- `--default-hp=<number>` (default `150`)
- `--city=<name>` (default `Chișinău`)
- `--delay=<ms>` (default `3000`)
- `--check-user-duplicates-before-create` — before `createListing`, load the partner user’s vehicle rows from the DB and skip create when a duplicate is found, in order: **(1)** same user + `partner_source_code = cipauto` + `partner_listing_external_key` matches this `sourceListingId` (case-insensitive); **(2)** else **Cod Produs** parsed from listing descriptions matches this id. Requires PostgreSQL env from `core/backend` (same as `seed-registry`). Ambiguous matches → `manual_review` with `DUPLICATE_AMBIGUOUS:` in `error`. Clear duplicate → registry `duplicate_skipped` with `DUPLICATE_MATCH:partner_key` or `DUPLICATE_MATCH:cod_produs`.

**Admin UI:** **Admin → Parsing → PDP** — **Check duplicates before create** on manual runs and PDP schedules sets the same flag (`config_snapshot.checkUserDuplicatesBeforeCreate`).

Without **`--update-existing`**, `cipauto:import` still performs a **narrow PATCH** of `partner_source_code`, `partner_listing_external_key`, and `partner_listing_canonical_url` after PDP when a registry row already has `kupitoListingId`, so scheduled runs can backfill partner metadata without rewriting the full listing body.

### `cipauto:report` flags

- `--last`
- `--env=local|prod`
- `--file=<path>`

## Required env variables

Primary Kupito import auth:

- `KUPITO_IMPORT_ADMIN_EMAIL`
- `KUPITO_IMPORT_ADMIN_PASSWORD`

Optional Kupito overrides:

- `KUPITO_IMPORT_API_URL`
- `KUPITO_IMPORT_SECRET`
- `KUPITO_IMPORT_DEBUG=1`

Legacy aliases are still supported (`CIPAUTO_*` auth/api/secret/debug).

Source-specific:

- `CIPAUTO_BASE_URL` (default `https://cipauto.md`)
- `CIPAUTO_REQUEST_TIMEOUT_MS`
- `CIPAUTO_MAX_RETRIES`
- `CIPAUTO_DEFAULT_DELAY_MS`
- `CIPAUTO_IMAGE_DELAY_MS`

## Runtime artifacts

Filesystem layout (registry + PLP + reports survive deploys only if this tree is on a **persistent volume**, e.g. Render Disk):

- `PARSING_RUNTIME_DIR` — optional; when unset, defaults to `core/backend/runtime/parsing` (relative to `cwd` when you run CLI from `core/backend`). On Render, set this to your **disk mount path** on the backend service (must match the mount path exactly). The same variable is forwarded into parser CLI children when you use **admin Parsing** or the **scheduler**, so CLI paths and the UI stay aligned.
- Optional overrides: `CIPAUTO_REGISTRY_PATH`, `CIPAUTO_CURRENT_PLP_PATH`, `CIPAUTO_REPORTS_DIR` (absolute or relative to `cwd`). When set, these are also forwarded to admin-spawned parser processes.

Default paths under `<PARSING_RUNTIME_DIR or runtime/parsing>/cipauto/`:

- `cipauto-registry.json` — registry history
- `cipauto-current-plp.json` — active PLP snapshot
- `reports/cipauto-run-*.json` — import run reports
- `reports/partner-url-check-cipauto-*.{json,csv}` — optional output from `npm run partner:check-urls -- --partner=cipauto ...`

Legacy locations under `src/scripts/tools/cipauto-import/data/` are no longer used by the CLI.

## Kupito site vs PLP vs registry

Three different layers:

1. **CipAuto catalog (PLP)** — HTML listing cards; `cipauto:scan` reads them and updates the registry plus `cipauto-current-plp.json`.
2. **Parser registry** (`cipauto-registry.json`) — maps `sourceListingId` (CipAuto product code) to import state and, when known, `kupitoListingId`. This file is what makes imports idempotent.
3. **Kupito database** — live listings for the partner user.

Scan summary line `[SCAN] [DONE] ... existingListings=... readyForImport=...` means:

- **`existingListings`** — PLP cards whose `sourceListingId` already has a registry row **with** `kupitoListingId` (already linked to a Kupito listing).
- **`readyForImport`** — cards that are candidates for create/update through the import command according to registry rules, not “unmatched HTML”.

If you already have hundreds of active partner listings on Kupito but **`existingListings` stays `0`**, the registry usually has **no** `sourceListingId → kupitoListingId` links yet (new machine, wiped `data/`, or listings were created outside this parser). That is **not** fixed by deleting listings and re-importing.

### Which flow applies?

| Symptom                                                                                                                 | Likely cause                                                            | Flow                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| After `cipauto:scan`, **`existingListings=0`** and large **`readyForImport`** while Kupito already has partner listings | Registry not seeded from DB                                             | **Registry seeding** below                                                    |
| Kupito count vs CipAuto catalog diverges; you need “still on CipAuto?” vs “should close”                                | Compare DB listings to latest PLP snapshot (and optionally HTTP checks) | **`cipauto:audit-stale`** (see [Stale listings audit](#stale-listings-audit)) |

## Registry seeding (existing Kupito listings)

When the partner already has listings in Kupito **before** the registry is populated, run **once** (per environment) before relying on scan/import counts:

```bash
cd core/backend
npm run cipauto:seed-registry -- [--env local|prod] <userId>
```

The script reads listings for that user from the **database** (same env as your TypeORM config), finds `Cod Produs: …` in descriptions (HTML entities and case are normalized), writes **`sourceListingId → kupitoListingId`** into `cipauto-registry.json`, and updates each matched Kupito row with **`partner_source_code`**, **`partner_listing_external_key`**, and **`partner_listing_canonical_url`** (derived CipAuto listing URL). Re-running is idempotent.

Then:

1. `npm run cipauto:scan -- --pages=<n> --env=prod` (or `local`) — **`existingListings`** should reflect cards already linked.
2. `npm run cipauto:import -- --userId=<UUID> ...` — add **`--update-existing`** when you intend to refresh PDP-backed fields for rows already linked.

**Requirements:** listings must contain a `Cod Produs:` line with the CipAuto product code in a description field; otherwise they are skipped by seeding and need manual description fixes.

**Environment:** use the same `--env` / DB for `seed-registry`, `scan`, and `import` so registry and snapshots align with the data you care about.

**Admin UI:** With `registrySyncEnabled` for CipAuto in the catalog, **Admin → Parsing → PLP files → Sync registry** on the mono PLP row runs the same `cipauto:seed-registry` child process as the CLI (partner UUID required; may be prefilled from recent PDP/PLP runs with an assigned user). Closing the modal does not cancel the job; cancel is explicit from the modal while the run is active.

**Admin UI (PDP):** **Admin → Parsing → manual PDP** and **new PDP schedules** use the same `sync-hint` request after you select the PLP file, so the partner UUID field is prefilled the same way as in **Sync registry** (no `registrySyncEnabled` required for that read-only hint).

Full script notes: `core/backend/docs/SCRIPTS.md` (Partner listing imports → **CipAuto registry seeding**).

### `partner:check-urls` (saved URL health check)

Shared script: re-fetches PDP for listings that already have **`partner_listing_canonical_url`** stored in Postgres. Reports land under **`reports/partner-url-check-cipauto-*.{json,csv}`** (same tree as other CipAuto reports).

```bash
cd core/backend
npm run partner:check-urls -- --partner cipauto --userId=<UUID> [--env local|prod] [--dry-run] [--limit=<n>] [--delay=<ms>]
```

See `core/backend/docs/SCRIPTS.md` → **Partner listing URL check** for flag details.

## Stale listings audit

When the issue is “active on Kupito but not in the latest PLP snapshot” (or you want to close listings gone from CipAuto), use:

```bash
cd core/backend
npm run cipauto:audit-stale -- [--env local|prod] <userId> --plp-file <path-to-cipauto-current-plp.json>
```

Treating the PLP JSON as the source of truth for active `sourceId` values avoids slow per-URL checks when you trust the last full scan.

Add **`--close`** only after you understand the audit categories (see `core/backend/docs/SCRIPTS.md` → **CipAuto stale listings audit**). Wrong closes affect live listings and promotions.

## Data lifecycle

States:

- `discovered`
- `pdp_parsed`
- `created`
- `updated`
- `closed`
- `failed`
- `skipped`
- `manual_review`

Source status:

- `active`
- `missing_candidate`
- `closed`

## Image pipeline

Parser does not transform images directly. For each image:

1. download from source
2. upload through `POST /api/upload/image`
3. use returned processed URL and `blurhash` in listing payload

The upload endpoint computes a blurhash for every image. The import pipeline collects these hashes and sends them as `image_blur_hashes` when creating/updating the listing, so blur placeholders are available immediately without a separate backfill step.

This preserves the same validation/watermark/format pipeline as regular website uploads.

## Troubleshooting

- `401`: verify admin credentials and admin role
- brand/model resolution errors: update platform catalog first
- fewer than 2 uploaded images: listing goes to `manual_review`
- source rate limits/timeouts: increase `--delay`
- interrupted run: rerun with `--resume`
