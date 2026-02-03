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

### Platform-Specific (Moldova)

Platform documentation is located in **[`docs/`](./docs/)**:

- **[Platform Documentation](./docs/README.md)** - Main entry point
- **[Deploy](./docs/deployment/PRODUCTION_DEPLOYMENT.md)** - Production instructions
- **[Scripts](./docs/scripts/SEED_ALL_BRANDS_COMPLETE.md)** - Scripts documentation
- **[Setup](./docs/setup/SETUP.md)** - Initial setup
- **[Features](./docs/features/)** - Feature documentation (URL/title, slugs)

### Core Documentation (universal)

All universal documentation in **core repository**:

- **[Core Documentation](./core/docs/README.md)** - General documentation
- **[Platform Guide](./core/docs/guides/PLATFORM_GUIDE.md)** - Creating platforms
- **[Deployment Guide](./core/docs/guides/DEPLOYMENT.md)** - Deployment
- **[Architecture](./core/docs/architecture/ARCHITECTURE_OVERVIEW.md)** - Architecture

---

**Built on:** [PPCSL](./core/) (Platform-Portable Car Sales Logic)

<!-- CI trigger 2026-02 -->
