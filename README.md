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

---

## 📦 Build Process

When running `npm run prepare:build`, files are copied from platform-repo to core:

```
assets/frontend/public/*        → core/frontend/public/
assets/backend/watermark/        → core/backend/assets/watermark/
locales/ro.json, locales/ru.json → core/frontend/lib/locales/
locales/backend/*.json          → core/backend/src/common/i18n/
theme/                          → core/frontend/lib/theme/
config/                         → core/frontend/lib/config/
```

**Core remains universal**, works for all platforms!

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

### Core (source of truth)

All shared documentation lives in **core**:

- **[Core docs](./core/docs/README.md)** — entry point
- **[Documentation architecture](./core/docs/documentation-architecture.md)** — structure, repo vs vault
- **[Reference](./core/docs/reference/)** — [popular-brands-sync](./core/docs/reference/popular-brands-sync.md), [platform-assets](./core/docs/reference/platform-assets.md), scripts, analytics
- **[Operations](./core/docs/operations/)** — Sentry launch checklist, deploy, monitoring
- **[Architecture](./core/docs/architecture/architecture-overview.md)** — system overview

---

**Built on:** [PPCSL](./core/) (Platform-Portable Car Sales Logic)

<!-- CI trigger 2026-02 -->
