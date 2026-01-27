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

1. Перейдите: Settings → Account → Auth Tokens
2. Нажмите "Create New Token"
3. Введите название токена (например: `kupito-deployment`)
4. Выберите права (scopes):
   - ✅ `project:releases` (для загрузки source maps)
   - ✅ `org:read` (для чтения информации об организации)
5. Нажмите "Create Token"
6. **ВАЖНО:** Скопируйте токен сразу! Он показывается только один раз
7. Это значение для `SENTRY_AUTH_TOKEN`

## Шаг 6: Добавление переменных окружения

### Фронтенд (`core/frontend/.env.local`)

Создайте или откройте файл `core/frontend/.env.local` и добавьте:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

**Пример реальных значений:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_ORG=my-company
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=sntrys_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

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

## Проверка

### Фронтенд

После добавления переменных:
1. Перезапустите dev сервер: `npm run dev`
2. Создайте тестовую ошибку в коде
3. Проверьте в Sentry: Issues → должна появиться ошибка в проекте `kupito-frontend`

### Бэкенд

После добавления переменных и деплоя:
1. Проверьте в Sentry: Issues → должны появиться ошибки в проекте `kupito-backend`
2. Проверьте Performance → Transactions для трейсов бэкенда

## Полезные ссылки

- [Sentry Dashboard](https://sentry.io)
- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
