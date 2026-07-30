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
npm run partner:check-urls -- --partner cipauto --userId=<UUID> --env=prod
```

### Флаги `cipauto:scan`

- `--pages` — нужное число страниц каталога
- `--page-from`, `--page-to` — опциональный диапазон
- `--resume`
- `--dry-run`
- `--env=local|prod`
- `--delay=<ms>`

## Пагинация PLP

1. **Страница 1:** `GET /catalog-auto/?sort=newest`
2. **Страница ≥ 2:** `GET /catalog-auto/page/{n}/?sort=newest`
3. **maxPages:** из `#vehicles-pagination` / `.page-numbers` (`data-page` и `.current`), либо `ceil(#vehicles-count / pageSize)` при наличии ссылки на следующую страницу (legacy: `window.vehiclesData.maxPages`)

Защита скана: пустая страница 1 сразу даёт ошибку; без `maxPages` скан останавливается после 2 пустых страниц подряд.
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
- `--check-user-duplicates-before-create` — перед `createListing` загрузить из БД объявления пользователя-партнёра и не создавать дубликат: **(1)** тот же пользователь + `partner_source_code = cipauto` + совпадение `partner_listing_external_key` с текущим `sourceListingId` (без учёта регистра); **(2)** иначе совпадение **Cod Produs** в описании объявления. Нужен PostgreSQL из `core/backend`, как у `seed-registry`. Неоднозначный случай — `manual_review` с `DUPLICATE_AMBIGUOUS:`. Явный дубликат — состояние реестра `duplicate_skipped` с `DUPLICATE_MATCH:partner_key` или `DUPLICATE_MATCH:cod_produs`.
- `--auto-create-brands` — если распознанная марка отсутствует в нашем каталоге, создать её через admin API (`POST /api/admin/brands`) и продолжить импорт объявления в этом же запуске. Учётная запись импорта должна быть **Admin**. HTTP 409 трактуется как гонка и обрабатывается одной повторной выборкой списка марок. Использовать только после ручной проверки нормализации марок, чтобы не плодить дубликаты из некорректного разбиения заголовка.
- `--auto-create-models` — если модели нет в каталоге под уже выбранной маркой, создать её через admin API (`POST /api/admin/vehicle-models`) и повторить разрешение в этом же запуске. Поведение admin-аккаунта и обработки 409 — то же, что и у `--auto-create-brands`.

В админке: **Admin → Parsing → PDP** — чекбоксы **Check duplicates before create**, **Auto-create missing brands** и **Auto-create missing models** для ручного запуска и для расписаний PDP сохраняют те же флаги (`config_snapshot.checkUserDuplicatesBeforeCreate`, `autoCreateBrands`, `autoCreateModels`).

Без **`--update-existing`** команда `cipauto:import` после PDP всё равно делает **узкий PATCH** полей `partner_source_code`, `partner_listing_external_key` и `partner_listing_canonical_url`, если в реестре уже есть `kupitoListingId` — чтобы плановые прогоны могли догнать технические поля без полного обновления объявления.

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
- `CIPAUTO_FLARESOLVERR_URL` — необязательный URL FlareSolverr (например `http://127.0.0.1:8191`). Если задан, HTML-запросы CipAuto (PLP/PDP/audit/проверка URL) идут через FlareSolverr `request.get` с одной уникальной browser-сессией на CLI-процесс. Нужен в production, когда Cloudflare отдаёт managed challenge (HTTP 403 «Just a moment...»). Не переиспользуйте cookie браузера с другого IP: clearance привязан к IP, а egress backend на Render отличается от отдельного сервиса FlareSolverr.
- `CIPAUTO_FLARESOLVERR_TIMEOUT_MS` — таймаут challenge FlareSolverr в мс (по умолчанию `60000`)

### Cloudflare / FlareSolverr

CipAuto может стоять за Cloudflare Bot Management. Обычный Node `fetch` тогда получает challenge вместо HTML каталога.

1. Локально: из `core/` выполните `docker compose up -d flaresolverr` (образ `ghcr.io/flaresolverr/flaresolverr:v3.5.0`, порт `127.0.0.1:8191`).
2. Задайте `CIPAUTO_FLARESOLVERR_URL=http://127.0.0.1:8191` для backend/CLI.
3. Смоук: `curl http://127.0.0.1:8191/health`, затем `npm run cipauto:scan -- --pages=1 --dry-run --env=local`.

На Render поднимите FlareSolverr как **Private Service** (без публичного URL) в том же workspace и region, что `kupito-backend`, и задайте на backend `CIPAUTO_FLARESOLVERR_URL=http://<имя-сервиса>:8191`. Держите `ADMIN_PARSING_MAX_CONCURRENT_RUNS=1`, пока не подтвердите запас RAM. Не публикуйте FlareSolverr в интернет.

Без `CIPAUTO_FLARESOLVERR_URL` Cloudflare challenge завершается короткой ошибкой с указанием на этот env (полный HTML challenge в лог не пишется).

## Артефакты рантайма

Файловая схема (реестр + PLP + отчёты переживают деплой только если каталог на **персистентном томе**, например Render Disk):

- `PARSING_RUNTIME_DIR` — необязательно; если не задано, по умолчанию `core/backend/runtime/parsing` (относительно `cwd` при запуске CLI из `core/backend`). На Render задайте **ровно mount path** диска на **сервисе backend** (не только в разовой Shell-сессии): админка **Parsing** и **планировщик** запускают те же CLI на этом хосте и резолвят `plpDataPath` относительно этого корня. Значение пробрасывается в дочерние процессы парсера.
- Переопределения: `CIPAUTO_REGISTRY_PATH`, `CIPAUTO_CURRENT_PLP_PATH`, `CIPAUTO_REPORTS_DIR` (абсолютный путь или относительно `cwd`); при задании тоже передаются в CLI, запущенные из админки.

Пути по умолчанию под `<PARSING_RUNTIME_DIR или runtime/parsing>/cipauto/`:

- `cipauto-registry.json` — реестр
- `cipauto-current-plp.json` — снимок PLP
- `reports/cipauto-run-*.json` — отчёты импорта
- `reports/partner-url-check-cipauto-*.{json,csv}` — при необходимости после `npm run partner:check-urls -- --partner cipauto ...`

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

Скрипт читает объявления этого пользователя из **БД** (то же окружение, что у TypeORM), ищет в описаниях `Cod Produs: …` (нормализуются HTML-сущности и регистр), пишет в `cipauto-registry.json` связки **`sourceListingId → kupitoListingId`** и обновляет в Kupito строки **`partner_source_code`**, **`partner_listing_external_key`** и **`partner_listing_canonical_url`** (канонический URL объявления на CipAuto). Повторный запуск идемпотентен.

Далее:

1. `npm run cipauto:scan -- --pages=<n> --env=prod` (или `local`) — **`existingListings`** должен отражать уже привязанные карточки.
2. `npm run cipauto:import -- --userId=<UUID> ...` — добавьте **`--update-existing`**, если нужно обновить поля с PDP для уже привязанных строк.

**Требования:** в поле описания должна быть строка с `Cod Produs:` и кодом товара CipAuto; иначе seed пропустит объявление — правки описания вручную.

**Окружение:** для `seed-registry`, `scan` и `import` используйте ту же БД / тот же смысл `--env`, чтобы реестр и снимки совпадали с данными.

**Админка:** при `registrySyncEnabled` для CipAuto в каталоге в **Админка → Parsing → файлы PLP** у строки единственного PLP есть пункт **«Синхронизировать»** — запускается тот же процесс, что и `cipauto:seed-registry` в CLI (нужен UUID партнёра на Kupito; может подставиться из недавних PDP/PLP с назначенным пользователем). Закрытие окна не отменяет задачу; отмена — отдельной кнопкой, пока запуск активен.

**Админка (PDP):** в **ручном PDP** и при **новом расписании PDP** после выбора файла PLP вызывается тот же `sync-hint`, что и в модалке синхронизации — поле UUID партнёра предзаполняется так же (для этого чтения не нужен `registrySyncEnabled`).

Подробности скриптов: `core/backend/docs/SCRIPTS.md` (Partner listing imports → **CipAuto registry seeding**).

### `partner:check-urls` (проверка по сохранённому URL)

Общий скрипт для CipAuto и 999.md: для объявлений с заполненным **`partner_listing_canonical_url`** снова дергается тот же PDP-парсер, что и при импорте; отчёты — **`reports/partner-url-check-cipauto-*.{json,csv}`** (каталог отчётов CipAuto).

```bash
cd core/backend
npm run partner:check-urls -- --partner cipauto --userId=<UUID> [--env local|prod] [--dry-run] [--limit=<n>] [--delay=<ms>]
```

Флаги и смысл исходов — в `core/backend/docs/SCRIPTS.md` → **Partner listing URL check**.

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

## Поля, не маппятся с источника

`availability`, `country_of_origin`, `owners_count`, `interior_color` и `seats` на HTML PDP CipAuto отсутствуют. Импорт их не заполняет; продавец может указать их в Kupito после импорта.

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
