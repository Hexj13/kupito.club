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

## Related core documentation

- `core/docs/features/parsing-framework.md` — generic parsing runtime, parser catalog contract, admin orchestration
- `core/backend/docs/SCRIPTS.md` — backend script operations and env notes
