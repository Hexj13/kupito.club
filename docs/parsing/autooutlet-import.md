---
title: AutoOutlet parser
owner: platform
tags:
  - type/feature
  - domain/parsing
  - scope/platform
  - status/active
---

# AutoOutlet Partner Listings Import

## Purpose

`autooutlet-import` migrates vehicle listings from `autooutlet.md` into Kupito through the backend API.

The parser follows the same operational model as `cipauto-import` (registry, reports, PDP pipeline, optional duplicate check, `--auto-create-brands` / `--auto-create-models`).

## Location

- `core/backend/src/scripts/tools/autooutlet-import/`
- Shared: `core/backend/src/scripts/tools/partner-import-shared/`
- Parser catalog: `config/parsers.ts` in the platform root (copied by `npm run prepare:build`)

## Source URLs

- Catalog: `https://autooutlet.md/catalog-auto/?sort=newest`
- Example PDP: `https://autooutlet.md/vehicul/301742-lixiang-l6/`

## Commands

From `core/backend`:

```bash
npm run autooutlet:scan -- --pages=3 --env=local
npm run autooutlet:import -- --userId=<UUID> --status=paused --env=local --limit=5
npm run autooutlet:report -- --last --env=local
npm run autooutlet:seed-registry -- [--env local|prod] <userId>
npm run autooutlet:audit-stale -- [--env local|prod] <userId> [--close] [--skip-verify] [--plp-file <path>]
npm run partner:check-urls -- --partner autooutlet --userId=<UUID> --env=local
```

## PLP pagination

1. **Bootstrap:** `GET` the first catalog page and read `window.vehiclesData.maxPages` plus `autooutletFilters.nonce` / `ajaxurl` from inline scripts.
2. **Page 1:** Parsed from the initial HTML (`#vehicles-grid .car-card`).
3. **Page ≥ 2:** Prefer `POST` to `wp-admin/admin-ajax.php` with `action=load_vehicles`, `nonce`, `page`, `sort=newest`, `view=grid`, and empty filter fields (same shape as the site’s `vehicle-archive.js`).
4. **Fallback** if AJAX fails or returns no cards: `GET /catalog-auto/page/{n}/?sort=newest`, then `GET /catalog-auto/?sort=newest&paged={n}`.

## Partner metadata

- `partner_source_code`: `autooutlet`
- `partner_listing_external_key`: numeric id from `/vehicul/<id>-slug/`
- `partner_listing_canonical_url`: canonical PDP URL

## Registry seeding

`autooutlet:seed-registry` resolves `sourceListingId` in order:

1. Existing `partner_source_code=autooutlet` + `partner_listing_external_key`
2. `Cod Produs:<id>` in listing descriptions (`description` / `description_ro` / `description_ru`)
3. Id parsed from `partner_listing_canonical_url` when it matches `/vehicul/<id>-.../`

## Stale audit

`autooutlet:audit-stale` cross-references the user’s vehicle listings against the active PLP snapshot (registry or `--plp-file`). Source ids are resolved like seed-registry. Optional HTTP verification uses the AutoOutlet PDP URL pattern when not using `--skip-verify` or PLP-only trust mode.

## Auto-create brands/models

Same flags as CipAuto: `--auto-create-brands`, `--auto-create-models`. Use brand auto-create only after manual review to avoid duplicates from title split issues.

## Env overrides

See `core/backend/docs/SCRIPTS.md` (`AUTOOUTLET_BASE_URL`, `AUTOOUTLET_REGISTRY_PATH`, `AUTOOUTLET_CURRENT_PLP_PATH`, `AUTOOUTLET_REPORTS_DIR`, request timeouts).

## Release status

The platform catalog ships AutoOutlet with `releaseStage: 'prepared'` and `schedulerEnabled: true` so admin PLP/PDP schedules can target AutoOutlet after operators validate live scan/import and stale handling.

## Tests

```bash
cd core/backend
npm run test -- autooutlet-import
```

## Known risks

- WordPress `nonce` can expire; the CLI falls back to direct catalog URLs when AJAX fails.
- PLP may still list sold cars; PDP and stale audit classify `VÂNDUT` / HTTP 404/410.
- Multi-word brands (`Lynk & Co`, `Mercedes-Benz`) depend on the catalog brand `<option>` list and longest-prefix title split (PLP and PDP; PDP loads the same list from the catalog page when `#filter-brand` is missing).
