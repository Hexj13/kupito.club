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

## Purpose

`cipauto-import` migrates vehicle listings from `cipauto.md` into Kupito through the backend API.

The parser is:

- idempotent (`sourceListingId` registry key)
- restartable (`--resume`)
- selective (`--only-failed`, `--source-id`, `--limit`)
- observable (structured logs + JSON reports)
- sequential (reduced source/API load)

## Location

Source of truth (platform):

- `parsers/cipauto-import/`

Runtime copy after `npm run prepare:build`:

- `core/backend/src/scripts/tools/cipauto-import/`

Shared import infrastructure remains in core:

- `core/backend/src/scripts/tools/partner-import-shared/`

## Commands

Run from repository root:

```bash
npm run prepare:build
cd core/backend
npm run cipauto:scan -- --pages=24 --env=prod
npm run cipauto:import -- --userId=<UUID> --status=paused --env=prod --limit=10
npm run cipauto:report -- --last --env=prod
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

- Registry history: `data/cipauto-registry.json`
- Active PLP snapshot: `data/cipauto-current-plp.json`
- Reports: `reports/cipauto-run-*.json`

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
