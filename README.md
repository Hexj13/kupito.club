---
title: Kupito.club
owner: platform
tags:
  - type/readme
  - scope/platform
  - status/active
---

# Kupito.club

**Platform for Moldova** - Car marketplace built on PPCSL core.

## 📁 Structure

This repository contains **only platform-specific files**:

```
kupito.club/
├── assets/           # Graphics resources (logos, icons, watermark)
│   ├── frontend/public/
│   └── backend/watermark/
├── config/           # Platform configuration
│   └── site.ts
├── locales/          # Translations (frontend: UI)
│   ├── ro.json
│   └── ru.json
├── locales/backend/  # API translations (errors, validation, vehicleOptions)
│   ├── en.json
│   ├── ro.json
│   └── ru.json
├── theme/            # Color scheme
│   └── colors.ts
├── core/             # Git submodule → PPCSL core
│   └── backend/src/scripts/platforms/md/  # Platform configs in core
├── package.json
└── README.md
```

**Core repository** contains all business logic and components.

---

## 🚀 Quick Start

```bash
# 1. Clone with submodule
git clone --recurse-submodules <repo-url>

# 2. Install dependencies
npm install
cd core/backend && npm install
cd ../frontend && npm install
cd ../..

# 3. Prepare build (copies platform files to core)
npm run prepare:build

# 4. Run
npm run dev
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:4000

---

## 🧪 Testing & Linting

```bash
# Frontend
cd core/frontend
npm run lint:fix      # ESLint
npm run format        # Prettier
npm run test          # Jest tests

# Backend
cd core/backend
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Jest tests
```

### Release check

From the repository root:

```bash
npm run release-check        # full: prepare:build + lint + test + integration + build
npm run release-check:fast   # quick: prepare:build + lint + unit tests (no integration, no build)
```

The same steps run in CI in parallel jobs; `release-check:fast` is also invoked from the `pre-push` husky hook (set `HUSKY=0` to skip).

---

## 📦 Build Process

`npm run prepare:build` copies platform files into the core submodule in place, without removing core-only files:

```
assets/frontend/public/*         → core/frontend/public/
assets/backend/watermark/*       → core/backend/assets/watermark/
locales/{ro,ru,en}.json          → core/frontend/lib/locales/
locales/backend/{ro,ru,en}.json  → core/backend/src/common/i18n/
theme/*.ts                       → core/frontend/lib/theme/
config/*.ts, config/*.json       → core/frontend/lib/config/
config/parsers.ts                → core/backend/src/common/config/parsers.ts
config/site.ts                   → core/backend/src/common/config/site.ts
theme/colors.ts (via script)     → core/frontend/lib/theme.json
```

The script is the single source of truth — CI uses the same `npm run prepare:build`, so there is no drift between local and CI copies.

Backend `config/site.ts` is written by `core/scripts/copy-backend-site-overlay.cjs` (strips `SiteConfig` types). That file and overlay i18n JSON except `en.json` are **not committed** to PPCSL; they exist only after `prepare:build`. Never stage them inside `core/`.

**Core remains universal**, works for all platforms.

---

## 🔄 Updating Core

```bash
cd core
git pull origin main
cd ..
git add core
git commit -m "chore: update PPCSL core"
git push
```

---

## 📚 Documentation

### Platform-only (Moldova)

- **[Setup](./docs/setup/setup.md)** — initial platform setup
- **[Deploy](./docs/deployment/production-deployment.md)** — production deployment
- **[Sentry](./docs/sentry/sentry-setup.md)** — Sentry setup and launch checklist (platform env)

### Core (PPCSL submodule)

Shared docs live in the **`core` submodule** ([PPCSL](https://github.com/Hexj13/PPCSL)). GitHub does not serve submodule files at `kupito.club/core/...` URLs — use the PPCSL links below (same paths under `./core/` after `git clone --recurse-submodules`).

- **[Core docs](https://github.com/Hexj13/PPCSL/blob/main/docs/README.md)** — entry point
- **[Documentation architecture](https://github.com/Hexj13/PPCSL/blob/main/docs/documentation-architecture.md)** — structure, repo vs vault
- **[Reference](https://github.com/Hexj13/PPCSL/tree/main/docs/reference)** — [popular-brands-sync](https://github.com/Hexj13/PPCSL/blob/main/docs/reference/popular-brands-sync.md), [platform-assets](https://github.com/Hexj13/PPCSL/blob/main/docs/reference/platform-assets.md)
- **[Operations](https://github.com/Hexj13/PPCSL/tree/main/docs/operations)** — Sentry launch checklist, deploy, monitoring
- **[Architecture](https://github.com/Hexj13/PPCSL/blob/main/docs/architecture/architecture-overview.md)** — system overview; [backend overview](https://github.com/Hexj13/PPCSL/blob/main/docs/architecture/backend-overview.md)

---

**Built on:** [PPCSL](./core/) (Platform-Portable Car Sales Logic)

<!-- CI trigger 2026-02 -->
