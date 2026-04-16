---
title: Парсер CipAuto
owner: platform
tags:
  - type/feature
  - domain/parsing
  - scope/platform
  - status/active
  - lang/ru
---

# Импорт объявлений партнёра CipAuto

Каноническая англоязычная версия: [cipauto-import.md](./cipauto-import.md).

## Назначение

`cipauto-import` переносит объявления о транспорте с `cipauto.md` в Kupito через backend API.

Парсер:

- идемпотентен (ключ реестра `sourceListingId`)
- возобновляем (`--resume`)
- выборочный (`--only-failed`, `--source-id`, `--limit`)
- наблюдаемый (структурные логи + JSON-отчёты)
- последовательный (снижена нагрузка на источник и API)

## Расположение кода

Источник правды (субмодуль core):

- `core/backend/src/scripts/tools/cipauto-import/`

Общая инфраструктура импорта (тоже в core):

- `core/backend/src/scripts/tools/partner-import-shared/`

Каталог парсеров платформы (какие парсеры включены):

- `config/parsers.ts` в корне платформы (копируется в `core/frontend/lib/config/parsers.ts` и `core/backend/src/common/config/parsers.ts` через `prepare:build`)

## Команды

Из корня репозитория:

```bash
npm run prepare:build  # синхронизирует config/parsers.ts в core
cd core/backend
npm run cipauto:scan -- --pages=24 --env=prod
npm run cipauto:import -- --userId=<UUID> --status=paused --env=prod --limit=10
npm run cipauto:report -- --last --env=prod
```

### Флаги `cipauto:scan`

- `--pages` — нужное число страниц каталога
- `--page-from`, `--page-to` — опциональный диапазон
- `--resume`
- `--dry-run`
- `--env=local|prod`
- `--delay=<ms>`

### Флаги `cipauto:import`

- `--userId` — обязательный UUID владельца
- `--status=active|paused` (по умолчанию `paused`)
- `--env=local|prod`
- `--limit=<n>`
- `--resume`
- `--dry-run`
- `--only-failed`
- `--update-existing`
- `--source-id=<sourceListingId>`
- `--registration-type=Local|Foreign|Cleared` (по умолчанию `Cleared`)
- `--default-hp=<number>` (по умолчанию `150`)
- `--city=<name>` (по умолчанию `Chișinău`)
- `--delay=<ms>` (по умолчанию `3000`)

### Флаги `cipauto:report`

- `--last`
- `--env=local|prod`
- `--file=<path>`

## Переменные окружения

Основная авторизация импорта в Kupito:

- `KUPITO_IMPORT_ADMIN_EMAIL`
- `KUPITO_IMPORT_ADMIN_PASSWORD`

Опциональные переопределения Kupito:

- `KUPITO_IMPORT_API_URL`
- `KUPITO_IMPORT_SECRET`
- `KUPITO_IMPORT_DEBUG=1`

Поддерживаются старые алиасы (`CIPAUTO_*` для auth/api/secret/debug).

Специфично для источника:

- `CIPAUTO_BASE_URL` (по умолчанию `https://cipauto.md`)
- `CIPAUTO_REQUEST_TIMEOUT_MS`
- `CIPAUTO_MAX_RETRIES`
- `CIPAUTO_DEFAULT_DELAY_MS`
- `CIPAUTO_IMAGE_DELAY_MS`

## Артефакты рантайма

Файловая схема (реестр + PLP + отчёты переживают деплой только если каталог на **персистентном томе**, например Render Disk):

- `PARSING_RUNTIME_DIR` — необязательно; если не задано, по умолчанию `core/backend/runtime/parsing` (относительно `cwd` при запуске CLI из `core/backend`). На Render задайте **ровно mount path** диска на **сервисе backend** (не только в разовой Shell-сессии): админка **Parsing** и **планировщик** запускают те же CLI на этом хосте и резолвят `plpDataPath` относительно этого корня. Значение пробрасывается в дочерние процессы парсера.
- Переопределения: `CIPAUTO_REGISTRY_PATH`, `CIPAUTO_CURRENT_PLP_PATH`, `CIPAUTO_REPORTS_DIR` (абсолютный путь или относительно `cwd`); при задании тоже передаются в CLI, запущенные из админки.

Пути по умолчанию под `<PARSING_RUNTIME_DIR или runtime/parsing>/cipauto/`:

- `cipauto-registry.json` — реестр
- `cipauto-current-plp.json` — снимок PLP
- `reports/cipauto-run-*.json` — отчёты импорта

Старые пути в `src/scripts/tools/cipauto-import/data/` CLI больше не использует.

## Сайт Kupito, PLP и реестр

Три разных слоя:

1. **Каталог CipAuto (PLP)** — карточки в HTML; `cipauto:scan` читает их и обновляет реестр и `cipauto-current-plp.json`.
2. **Реестр парсера** (`cipauto-registry.json`) — сопоставляет `sourceListingId` (код товара CipAuto) со состоянием импорта и при наличии с `kupitoListingId`. Этот файл обеспечивает идемпотентность импорта.
3. **База Kupito** — живые объявления пользователя-партнёра.

Строка итога скана `[SCAN] [DONE] ... existingListings=... readyForImport=...` означает:

- **`existingListings`** — карточки PLP, у которых для `sourceListingId` в реестре уже есть строка **с** `kupitoListingId` (уже привязано к объявлению в Kupito).
- **`readyForImport`** — карточки-кандидаты на create/update через import по правилам реестра; это не «HTML PLP не смэтчился».

Если на Kupito уже сотни активных объявлений партнёра, а **`existingListings` остаётся `0`**, в реестре обычно ещё **нет** связок `sourceListingId → kupitoListingId` (новая машина, очищенный `data/` или объявления создавались не этим парсером). **Удалять** объявления и заводить заново **не нужно** — это не исправляет причину.

### Какой сценарий?

| Симптом                                                                                                                   | Вероятная причина                                        | Действие                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| После `cipauto:scan` **`existingListings=0`** и большой **`readyForImport`**, хотя на Kupito уже есть объявления партнёра | Реестр не заполнен из БД                                 | **Заполнение реестра (seed)** ниже                                    |
| Расходятся счётчики Kupito и каталога CipAuto; нужно понять «ещё на CipAuto?» vs «закрыть»                                | Сверка объявлений в БД со снимком PLP (опционально HTTP) | **`cipauto:audit-stale`** (раздел «Аудит устаревших объявлений» ниже) |

## Заполнение реестра (уже есть объявления в Kupito)

Если у партнёра в Kupito уже есть объявления **до** того, как реестр заполнен, один раз (на окружение) выполните **до** того, как ориентироваться на цифры scan/import:

```bash
cd core/backend
npm run cipauto:seed-registry -- [--env local|prod] <userId>
```

Скрипт читает объявления этого пользователя из **БД** (то же окружение, что у TypeORM), ищет в описаниях `Cod Produs: …` (нормализуются HTML-сущности и регистр) и пишет в `cipauto-registry.json` связки **`sourceListingId → kupitoListingId`**. Повторный запуск идемпотентен.

Далее:

1. `npm run cipauto:scan -- --pages=<n> --env=prod` (или `local`) — **`existingListings`** должен отражать уже привязанные карточки.
2. `npm run cipauto:import -- --userId=<UUID> ...` — добавьте **`--update-existing`**, если нужно обновить поля с PDP для уже привязанных строк.

**Требования:** в поле описания должна быть строка с `Cod Produs:` и кодом товара CipAuto; иначе seed пропустит объявление — правки описания вручную.

**Окружение:** для `seed-registry`, `scan` и `import` используйте ту же БД / тот же смысл `--env`, чтобы реестр и снимки совпадали с данными.

Подробности скриптов: `core/backend/docs/SCRIPTS.md` (Partner listing imports → **CipAuto registry seeding**).

## Аудит устаревших объявлений

Когда проблема в том, что объявление **активно в Kupito**, но **нет в последнем снимке PLP** (или нужно закрыть то, что исчезло с CipAuto):

```bash
cd core/backend
npm run cipauto:audit-stale -- [--env local|prod] <userId> --plp-file <path-to-cipauto-current-plp.json>
```

Если доверяете последнему полному скану, JSON PLP как источник истины по активным `sourceId` избавляет от медленных проверок по URL.

Флаг **`--close`** подключайте только после того, как разберётесь с категориями аудита (см. `core/backend/docs/SCRIPTS.md` → **CipAuto stale listings audit**). Ошибочное закрытие затрагивает живые объявления и промо.

## Жизненный цикл данных

Состояния:

- `discovered`
- `pdp_parsed`
- `created`
- `updated`
- `closed`
- `failed`
- `skipped`
- `manual_review`

Статус на источнике:

- `active`
- `missing_candidate`
- `closed`

## Конвейер изображений

Парсер не трансформирует файлы сам. Для каждого изображения:

1. скачивание с источника
2. загрузка через `POST /api/upload/image`
3. в payload объявления попадают обработанный URL и `blurhash`

Эндпоинт загрузки считает blurhash для каждого файла; импорт собирает хэши и отправляет их как `image_blur_hashes` при create/update, чтобы превью работали без отдельного backfill.

## Устранение неполадок

- `401`: проверить учётные данные админа и роль admin
- ошибки brand/model: сначала обновить каталог платформы
- меньше двух загруженных изображений: объявление уходит в `manual_review`
- лимиты/таймауты источника: увеличить `--delay`
- прерванный прогон: повтор с `--resume`
