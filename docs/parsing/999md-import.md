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

Filesystem layout (registry + per-login PLP JSON + reports survive deploys only if this tree is on a **persistent volume**, e.g. Render Disk):

- `PARSING_RUNTIME_DIR` — optional; when unset, defaults to `core/backend/runtime/parsing` (relative to `cwd` when you run CLI from `core/backend`). On Render, set to your **disk mount path** (must match the backend service env if you use admin Parsing or schedules).
- Optional overrides: `SITE999MD_REGISTRY_PATH`, `SITE999MD_REPORTS_DIR` (absolute or relative to `cwd`).

Default paths under `<PARSING_RUNTIME_DIR or runtime/parsing>/999md/`:

- `999md-registry.json`
- `current-plp/<login>.json` — PLP snapshots per profile login
- `reports/999md-run-*.json`

These files are runtime data, ignored by git, and must not be committed. Legacy paths under `src/scripts/tools/999md-import/data/` are not used by the CLI.

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
