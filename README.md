# Kupito.club

Platform for Macedonia - Car marketplace built on PPCSL core.

## Structure

This repository contains only platform-specific configuration:

- `locales/mk.json` - Macedonian translations
- `locales/en.json` - English translations
- `theme/colors.ts` - Macedonian color scheme
- `config/site.ts` - Site configuration (domain, locale, currency, etc.)
- `core/` - Git submodule pointing to PPCSL core repository

## Development

```bash
# Initialize submodule (first time)
git submodule update --init --recursive

# Update core to latest version
cd core
git pull origin main
cd ..

# Prepare build (copies locale files to core)
npm run prepare:build

# Build frontend
npm run build

# Build backend
npm run build:backend
```

## Updating Core

When PPCSL core is updated:

```bash
cd core
git pull origin main
cd ..
git add core
git commit -m "chore: update PPCSL core"
git push
```

## Build Process

During build, platform-specific files are copied to `core/frontend/lib/`:
- `locales/` → `core/frontend/lib/locales/` (for fallback, translations are loaded directly from root)
- `theme/` → `core/frontend/lib/theme/`
- `config/` → `core/frontend/lib/config/`

**Note:** Translation files (`locales/mk.json`, `locales/en.json`) are loaded directly from the root directory. The copy to `core/frontend/lib/locales/` is kept for backward compatibility and fallback purposes. Theme and config files still require copying to core.
