# Platform Assets

Графические ресурсы платформы (логотипы, иконки, watermark).

## 📁 Structure

```
assets/
├── frontend/public/
│   ├── favicon*.png      # Все размеры favicon
│   ├── logo*.png         # Логотипы платформы
│   ├── og-image.jpg      # Open Graph изображение
│   └── pwa192.png        # PWA иконка
└── backend/watermark/
    └── logo.png          # Watermark для фотографий
```

## 🔄 How It Works

**1. Источник:** Файлы в `assets/` - **source of truth**  
**2. Копирование:** При `npm run prepare:build` копируются в `core/`  
**3. Использование:** Core использует скопированные ресурсы

```bash
assets/frontend/public/*     → core/frontend/public/
assets/backend/watermark/    → core/backend/assets/watermark/
```

## 📋 Required Files

### Frontend (`frontend/public/`)
- `favicon-16.png`, `favicon-32.png`, `favicon-64.png`, `favicon-192.png`, `favicon-512.png`, `favicon.ico`
- `logo.png`, `logo-desktop.png`, `logo-mobile.png`
- `og-image.jpg` (1200x630px), `opengraph-image.png` (1200x630px)
- `pwa192.png` (192x192px)

### Backend (`backend/watermark/`)
- `logo.png` - PNG с прозрачным фоном, ~200x200px, светлый цвет

## 🎨 Asset Requirements

**Детальная документация:**
- [core/docs/guides/PLATFORM_CHECKLIST.md](../core/docs/guides/PLATFORM_CHECKLIST.md) - Чеклист и требования
- [core/docs/platform-plans/PLAN_ALBANIA_PLATFORM.md](../core/docs/platform-plans/PLAN_ALBANIA_PLATFORM.md) - Пример (Этап 12)

**Tools:**
- [Real Favicon Generator](https://realfavicongenerator.net/) - для генерации favicon

## ⚠️ Important

- ❌ **Не коммитить** скопированные assets в core
- ✅ **Всегда редактировать** в `assets/`, не в core
- ✅ Assets в core - **временные**, пересоздаются при каждом build
