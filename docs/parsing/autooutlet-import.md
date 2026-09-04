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
- Example PDP: `https://autooutlet.md/vehicul/205910-byd-tang-l/`

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

1. **Catalog page 1:** `GET https://autooutlet.md/catalog-auto/?sort=newest` — SSR HTML with `article.vehicle-card` cards.
2. **Page ≥ 2:** `GET` with `?sort=newest&page={n}` (fallback `?page={n}`).
3. **maxPages:** from `.pagination-page` buttons, or `ceil(total / pageSize)` using `.results-count` / `.filters-result-count` (legacy: `window.vehiclesData.maxPages`).
4. **Brands:** from `#filter-brand option` when present; otherwise `GET /marci-modele/` and `.brand-name` text for title split (PLP and PDP).

Legacy WordPress paths (`POST load_vehicles`, `/catalog-auto/page/{n}/`, `?paged={n}`) are no longer used by the live site.

Scan safety: page 1 with 0 cards throws immediately; without `maxPages`, scan stops after 2 consecutive empty pages.

## PDP parsing

1. **Fetch:** `GET https://autooutlet.md/vehicul/<id>-slug/` — SSR HTML with `main.autooutlet-single-vehicle`.
2. **Status:** only from `.autooutlet-header-badges .badge` (`DISPONIBIL`, `În drum`, `La comandă`, `Rezervat` → active; `Vândut` → closed) or JSON-LD `offers.availability` (`InStock` vs `SoldOut`). Page-wide i18n strings like `"sold":"Vândut"` are ignored.
3. **Availability** (listing field, separate from source closed/active): header badges `DISPONIBIL`, `În drum`, `Rezervat` → `InStock`; `La comandă` → `OnOrder`. JSON-LD `offers.availability`: `InStock` / `LimitedAvailability` → `InStock`; `PreOrder` → `OnOrder`. Omitted when PDP is closed/sold.
4. **Seats:** spec badges matching `N locuri` (integer 1–9).
5. **JSON-LD:** prefers `@type: Car` (fallback legacy `Product`) for title, brand/model, year, mileage, fuel, transmission, drive, body, color, price, and availability when DOM is missing.
6. **Gallery:** extracts original image URLs from Next `/_next/image/?url=…` inside `.vehicle-gallery-simple` / `.autooutlet-gallery-*`; legacy `#gallery-data` and `wp-content/uploads` remain as fallback.
7. **Specs / credit / description / options:** DOM selectors `.autooutlet-specifications`, `.autooutlet-price`, `.autooutlet-description-*`, `.autooutlet-options-grid`.
8. **Brands:** same `/marci-modele/` list as PLP for multi-word title split.

Import still requires at least 2 uploaded images; closed PDPs are not created/updated.

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

## Closing listings gone from the source

Like CipAuto, `autooutlet:import --plp-file=... --remove-closed` closes the linked Kupito listing when PDP reports the source closed (HTTP 404/410 or sold template) or when the listing disappeared from the PLP; without `--remove-closed` such listings are only marked `source_only` in the registry and stay active. The PLP snapshot carries `meta.missingCandidateSourceIds` / `meta.closeEstimateSourceIds` so listings that left the PLP are still selected for PDP checks. Older snapshots without these arrays cannot drive closure — re-run `autooutlet:scan` or use `--source-id`.

Partner-imported listings set `listings.is_parsed = true` (migration backfill + create with partner keys). The platform 90-day auto-close cron **skips** `is_parsed` rows; use `--remove-closed` / `autooutlet:audit-stale` for source-driven closure.

```bash
# After a fresh PLP scan: mark registry/PLP-linked listings (any status)
npm run partner:mark-parsed -- --partner=autooutlet --userId=<UUID> --env=prod [--plp-file <path>] [--dry-run]

# Reopen Closed is_parsed listings still live on AutoOutlet (does not change last_updated_at)
npm run partner:reopen-parsed -- --partner=autooutlet --userId=<UUID> --env=prod [--dry-run]
```

## Auto-create brands/models

Same flags as CipAuto: `--auto-create-brands`, `--auto-create-models`. Use brand auto-create only after manual review to avoid duplicates from title split issues.

## Env overrides

See `core/backend/docs/scripts.md` (`AUTOOUTLET_BASE_URL`, `AUTOOUTLET_REGISTRY_PATH`, `AUTOOUTLET_CURRENT_PLP_PATH`, `AUTOOUTLET_REPORTS_DIR`, request timeouts).

## Release status

The platform catalog ships AutoOutlet with `releaseStage: 'prepared'` and `schedulerEnabled: true` so admin PLP/PDP schedules can target AutoOutlet after operators validate live scan/import and stale handling.

## Tests

```bash
cd core/backend
npm run test -- autooutlet-import
```

## Known risks

- Next.js catalog/PDP markup may change again; parser supports both current Next selectors and legacy WordPress paths.
- PLP may still list sold cars; PDP status uses header badges / JSON-LD availability, not page-wide text search.
- Multi-word brands (`Lynk & Co`, `Mercedes-Benz`) depend on the catalog brand list or `/marci-modele/` and longest-prefix title split (PLP and PDP).
- Battery capacity / EV range stay in description text only; Kupito listing payload has no dedicated fields for them yet.
