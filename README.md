# Kupito.club

**Platform for Macedonia** - Car marketplace built on PPCSL core.

## 📁 Structure

This repository contains **only platform-specific files**:

```
kupito.club/
├── assets/           # Графические ресурсы (логотипы, иконки, watermark)
│   ├── frontend/public/
│   └── backend/watermark/
├── config/           # Конфигурация платформы
│   └── site.ts
├── locales/          # Переводы
│   └── mk.json
├── theme/            # Цветовая схема
│   └── colors.ts
├── core/             # Git submodule → PPCSL core
│   └── backend/src/scripts/platforms/mk/  # Platform configs в core
├── package.json
└── README.md
```

**Core repository** содержит всю бизнес-логику и компоненты.

---

## 🚀 Quick Start

```bash
# 1. Клонировать с submodule
git clone --recurse-submodules <repo-url>

# 2. Установить зависимости
npm install
cd core/backend && npm install
cd ../frontend && npm install
cd ../..

# 3. Подготовить сборку (копирует platform-файлы в core)
npm run prepare:build

# 4. Запустить
npm run dev
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:4000

---

## 📦 Build Process

При запуске `npm run prepare:build` файлы копируются из platform-repo в core:

```
assets/frontend/public/*     → core/frontend/public/
assets/backend/watermark/    → core/backend/assets/watermark/
locales/                     → core/frontend/lib/locales/
theme/                       → core/frontend/lib/theme/
config/                      → core/frontend/lib/config/
```

**Core остаётся универсальным**, работает для всех платформ!

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

Вся документация в **core repository**:

- **[Core Documentation](./core/docs/README.md)** - Общая документация
- **[Platform Guide](./core/docs/guides/PLATFORM_GUIDE.md)** - Создание платформ
- **[Deployment Guide](./core/docs/guides/DEPLOYMENT.md)** - Деплой
- **[Architecture](./core/docs/architecture/README_ARCHITECTURE.md)** - Архитектура

---

**Built on:** [PPCSL](./core/) (Platform-Portable Car Sales Logic)
