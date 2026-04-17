---
title: Platform parsing docs
owner: platform
tags:
  - type/readme
  - domain/parsing
  - scope/platform
  - status/active
---

# Kupito Parsing Documentation

Platform-specific parser implementation and operations for `kupito.club`.

## Scope

- Concrete parser behavior for Moldova sources
- CLI command usage and flags
- Env variables and rollout checklist
- Registry/report artifacts and troubleshooting

## Documents

- [cipauto-import.md](./cipauto-import.md) — CipAuto HTML parser (includes Kupito vs registry vs PLP operations)
- [cipauto-import-ru.md](./cipauto-import-ru.md) — same (Russian)
- [999md-import.md](./999md-import.md) — 999.md GraphQL parser
- Shared **`npm run partner:check-urls`** (CipAuto + 999.md, reports under each parser’s `reports/`) — see [999md-import.md](./999md-import.md) § `partner:check-urls` and `core/backend/docs/SCRIPTS.md`

### Admin UI (registry sync)

For parsers with `registrySyncEnabled` in the platform catalog (`config/parsers.ts`), Kupito **Admin → Parsing → PLP files** exposes **Sync registry** on each PLP file row. It queues the same `seed-registry` logic as the CLI (live logs, optional cancel, report when the script finishes). See [cipauto-import.md](./cipauto-import.md) and [999md-import.md](./999md-import.md) under registry seeding.

### Admin UI (PDP — partner UUID prefill)

When you pick a **PLP file** in the **manual PDP** modal or in a **new PDP schedule**, the UI calls the same **`GET .../plp-files/:fileKey/sync-hint`** as **Sync registry** and prefills **Assigned user (UUID)** from `suggestedAssignedUserId` (recent PDP/PLP runs for that file). For **999.md**, a warning appears if the login inside the PLP JSON does not match the file name. This read is allowed for parsers with PDP in the catalog (not only those with `registrySyncEnabled`); starting a **Sync registry** run still requires that flag.

### Admin UI (PDP — check duplicates before create)

In **Admin → Parsing**, the manual PDP run form and **scheduler** PDP `config_snapshot` can enable **Check duplicates before create** (`checkUserDuplicatesBeforeCreate`). That queues the import CLI with `--check-user-duplicates-before-create` (same behavior as documented for `cipauto:import` / `999md:import`). JSON import reports then include `summary.duplicateSkipped` and `duplicateSkippedItems` when rows are skipped. Overview: [parsing-framework.md](../../core/docs/features/parsing-framework.md); CLI flags: [cipauto-import.md](./cipauto-import.md) and [999md-import.md](./999md-import.md) (`### …:import` flags).

## Related core documentation

- `core/docs/features/parsing-framework.md` — generic parsing runtime, parser catalog contract, admin orchestration
- `core/backend/docs/SCRIPTS.md` — backend script operations and env notes
