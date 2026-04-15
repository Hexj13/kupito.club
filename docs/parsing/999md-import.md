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

## Location

Source of truth (platform):

- `parsers/999md-import/`

Runtime copy after `npm run prepare:build`:

- `core/backend/src/scripts/tools/999md-import/`

Shared import infrastructure remains in core:

- `core/backend/src/scripts/tools/partner-import-shared/`

## Commands

Run from repository root:

```bash
npm run prepare:build
cd core/backend
npm run 999md:scan -- --login=AGMOTORS --env=local --page-size=50
npm run 999md:import -- --userId=<UUID> --status=paused --env=local --limit=5
npm run 999md:report -- --last --env=local
```

### `999md:scan` flags

- `--login` required profile login on 999.md
- `--page-size=<n>` (default `50`)
- `--max-items=<n>`
- `--resume`
- `--dry-run`
- `--env=local|prod`
- `--delay=<ms>` (default `3000`)

### `999md:import` flags

Same semantics as `cipauto:import`:

- `--userId` (required), `--status`, `--env`, `--limit`, `--resume`, `--dry-run`
- `--only-failed`, `--update-existing`, `--source-id`
- `--registration-type`, `--default-hp`, `--city`, `--delay`

### `999md:report` flags

- `--last`
- `--file=<path>`
- `--env=local|prod`

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

## Runtime artifacts

- Registry: `data/999md-registry.json`
- Reports: `reports/999md-run-*.json`

These files are generated runtime data and must stay local. They are ignored by git and should never be committed.

## Mapping highlights

- GraphQL subcategory is normalized to `car`, `truck`, or `moto`
- unresolved subcategory -> `manual_review` (`UNMAPPED_SUBCATEGORY`)
- brand/model resolution uses shared `BrandModelResolver` with `vehicleType`
- parser reuses shared enum/color/equipment/field mapping pipeline

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
