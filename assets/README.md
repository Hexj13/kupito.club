---
title: Platform assets (summary)
owner: platform
tags:
  - type/reference
  - domain/platform
  - scope/platform
  - status/active
---

# Platform Assets

**Canonical doc:** [core/docs/reference/platform-assets.md](../core/docs/reference/platform-assets.md)

Platform graphics resources (logos, icons, watermark). Summary below; full checklist and copy rules in core.

## 📁 Structure

```
assets/
├── frontend/public/
│   ├── favicon*.png      # All favicon sizes
│   ├── logo.png          # Square icon (PWA / schema)
│   ├── logo-desktop.svg  # Header logo
│   ├── logo-mobile.svg   # Header logo (same mark below xl)
│   ├── og-image.jpg      # Open Graph image
│   └── pwa192.png        # PWA icon
└── backend/watermark/
    └── logo.png          # Watermark for photos
```

## 🔄 How It Works

**1. Source:** Files in `assets/` are the **source of truth**  
**2. Copy:** Copied to `core/` during `npm run prepare:build`  
**3. Usage:** Core uses the copied resources

```bash
assets/frontend/public/*     → core/frontend/public/
assets/backend/watermark/    → core/backend/assets/watermark/
```

## 📋 Required Files

### Frontend (`frontend/public/`)
- `favicon-16.png`, `favicon-32.png`, `favicon-64.png`, `favicon-192.png`, `favicon-512.png`, `favicon.ico`
- `logo.png`, `logo-desktop.svg`, `logo-mobile.svg`
- `og-image.jpg` (1200x630px), `opengraph-image.png` (1200x630px)
- `pwa192.png` (192x192px)

### Backend (`backend/watermark/`)
- `logo.png` - PNG with transparent background, ~200x200px, light color

## 🎨 Asset Requirements

**Detailed documentation:**
- [core/docs/guides/platform-checklist.md](../core/docs/guides/platform-checklist.md) - Checklist and requirements

**Tools:**
- [Real Favicon Generator](https://realfavicongenerator.net/) - for favicon generation

## ⚠️ Important

- ❌ **Do not commit** copied assets to core
- ✅ **Always edit** in `assets/`, not in core
- ✅ Assets in core are **temporary**, recreated on each build
