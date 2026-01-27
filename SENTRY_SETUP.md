# Инструкция по настройке Sentry

## Шаг 1: Создание проектов в Sentry

### Фронтенд проект

1. Перейдите на https://sentry.io
2. Войдите или создайте аккаунт
3. Создайте новый проект для фронтенда:
   - Нажмите "Create Project"
   - Выберите платформу: **Next.js**
   - Введите название проекта (например: `kupito-frontend`)
   - Нажмите "Create Project"

### Бэкенд проект

1. В том же аккаунте Sentry создайте второй проект:
   - Нажмите "Create Project" (или перейдите в Projects → Create Project)
   - Выберите платформу: **Node.js**
   - Введите название проекта (например: `kupito-backend`)
   - На вопрос "Do you use a framework?" выберите **Nest.js** (не "Nope, Vanilla")
   - Нажмите "Configure SDK" или "Create Project"

**Важно:** 
- Фронтенд и бэкенд должны быть разными проектами, так как это разные платформы с разными настройками
- Выбор "Nest.js" даст более точную настройку и автоматическую инструментацию для NestJS приложений

## Шаг 2: Получение DSN

1. После создания проекта вы увидите страницу с инструкциями
2. Найдите поле **DSN** (Data Source Name)
3. Скопируйте значение (выглядит как: `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Это значение для `NEXT_PUBLIC_SENTRY_DSN`

**Альтернативный способ:**
- Settings → Projects → [ваш проект] → Client Keys (DSN)
- Скопируйте DSN

## Шаг 3: Получение названия организации (SENTRY_ORG)

1. Посмотрите в левый верхний угол интерфейса Sentry
2. Там будет название вашей организации (slug)
3. Или перейдите: Settings → Organizations
4. Это значение для `SENTRY_ORG`

**Пример:** Если URL выглядит как `https://sentry.io/organizations/my-org/...`, то `SENTRY_ORG=my-org`

## Шаг 4: Получение названия проекта (SENTRY_PROJECT)

1. Это название проекта, которое вы ввели при создании
2. Или посмотрите в URL: `https://sentry.io/organizations/[ORG]/projects/[PROJECT]/`
3. Это значение для `SENTRY_PROJECT`

**Пример:** Если вы создали проект `kupito-frontend`, то `SENTRY_PROJECT=kupito-frontend`

## Шаг 5: Создание Auth Token (SENTRY_AUTH_TOKEN)

1. Перейдите: **Settings → Developer Settings → Personal Tokens** (или **Organization Tokens**)
   - **Personal Tokens** — для личного использования
   - **Organization Tokens** — для использования командой (рекомендуется для деплоя)
2. Нажмите **"Create New Token"**
3. Введите название токена (например: `kupito-frontend-deployment`)
4. Выберите права (scopes):
   - ✅ `project:releases` (для загрузки source maps)
   - ✅ `org:read` (для чтения информации об организации)
5. Нажмите **"Create Token"**
6. **ВАЖНО:** Скопируйте токен сразу! Он показывается только один раз
7. Это значение для `SENTRY_AUTH_TOKEN`

**Примечание:** Не используйте "Custom Integrations" — это для создания приложений. Для фронтенда нужен простой Personal/Organization Token.

## Шаг 6: Добавление переменных окружения

### Фронтенд для Production (Render.com или другой хостинг)

**Важно:** Sentry настроен работать **только в production**. В development он отключен.

Добавьте переменные окружения в Render.com (или где у вас хостится фронтенд):

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=your-auth-token
NODE_ENV=production
```

**Пример реальных значений:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://bef3229c62ce8e2cdde11fb1e7d2abd3@o4510783132008448.ingest.de.sentry.io/4510783135744080
SENTRY_ORG=kupitoclub
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=sntrys_xxx...
NODE_ENV=production
```

**Для локальной разработки (опционально):**

Если хотите тестировать Sentry локально, добавьте в `core/frontend/.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

Но обычно это не нужно — Sentry работает только в production на сервере.

### Бэкенд (переменные окружения на сервере)

Добавьте переменные окружения для бэкенда (в Render.com или где у вас хостится бэкенд):

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

**Важно:**
- `SENTRY_DSN` — это DSN из проекта **Node.js** (бэкенд), не из Next.js проекта
- `NODE_ENV=production` — обязательно, иначе Sentry будет отключен на бэкенде
- Это должны быть **разные DSN** для фронтенда и бэкенда

## Структура файлов Sentry

После настройки в проекте будут следующие файлы:

### Фронтенд (`core/frontend/`)

- `instrumentation-client.ts` - клиентская инициализация Sentry
- `sentry.server.config.ts` - серверная инициализация Sentry
- `sentry.edge.config.ts` - edge runtime инициализация Sentry
- `instrumentation.ts` - регистрация серверных и edge конфигураций
- `app/global-error.tsx` - перехват глобальных ошибок React
- `app/error.tsx` - перехват ошибок через Error Boundary
- `app/sentry-test/page.tsx` - тестовая страница для проверки Sentry

### Бэкенд (`core/backend/src/`)

- `common/sentry.config.ts` - инициализация Sentry для NestJS
- `common/interceptors/sentry.interceptor.ts` - interceptor для контекста запросов
- `common/filters/http-exception.filter.ts` - отправка ошибок в Sentry

## Проверка

### Фронтенд

**Важно:** Sentry работает только в production (`NODE_ENV=production`).

После деплоя в production:
1. Проверьте в Sentry: Issues → должны появиться ошибки в проекте `kupito-frontend`
2. Проверьте Performance → Transactions для трейсов фронтенда
3. Проверьте Replays → Session Replay для записей сессий с ошибками

**Для тестирования в production:**
- Откройте сайт в production
- Создайте тестовую ошибку (например, через `/sentry-test` если страница доступна)
- Проверьте в Sentry: Issues → должна появиться ошибка

### Бэкенд

После добавления переменных и деплоя:
1. Проверьте в Sentry: Issues → должны появиться ошибки в проекте `kupito-backend`
2. Проверьте Performance → Transactions для трейсов бэкенда

## Особенности конфигурации

- **Sentry активен только в production** - в development он отключен
- **TracesSampleRate: 0.1** - собирается 10% трейсов в production (оптимизация)
- **ReplaysOnErrorSampleRate: 1.0** - записываются все сессии с ошибками
- **ReplaysSessionSampleRate: 0.1** - записывается 10% всех сессий
- **enableLogs: true** - логирование включено
- **consoleLoggingIntegration** - автоматическая отправка console.error и console.warn

## Что отслеживается

### Фронтенд

- ✅ JavaScript ошибки на клиенте
- ✅ Unhandled promise rejections
- ✅ Ошибки из Error Boundary (`app/error.tsx`)
- ✅ Глобальные ошибки React (`app/global-error.tsx`)
- ✅ Критические ошибки API (статус >= 500)
- ✅ Performance Monitoring (трейсы навигации и запросов)
- ✅ Session Replay (записи сессий с ошибками)
- ✅ Console ошибки и предупреждения (через consoleLoggingIntegration)

### Бэкенд

- ✅ Ошибки сервера (статус >= 500)
- ✅ Unhandled exceptions
- ✅ Performance Monitoring (трейсы HTTP запросов)
- ✅ Profiling (профилирование производительности)
- ✅ Контекст запросов (метод, путь, пользователь)

## Полезные ссылки

- [Sentry Dashboard](https://sentry.io)
- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Manual Setup Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
