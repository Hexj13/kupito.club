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
- **TracesSampleRate (Client): 0.1** - собирается 10% трейсов на клиенте в production
- **TracesSampleRate (Server/Edge): 1.0** - собирается 100% трейсов на сервере (можно снизить при высоком трафике)
- **ReplaysOnErrorSampleRate: 1.0** - записываются все сессии с ошибками
- **ReplaysSessionSampleRate: 0.1** - записывается 10% всех сессий
- **enableLogs: true** - логирование включено
- **consoleLoggingIntegration** - автоматическая отправка console.error и console.warn
- **browserTracingIntegration** - автоматическая инструментация навигации, fetch запросов и Web Vitals
- **Metrics** - включены по умолчанию (SDK 10.37.0 поддерживает метрики)
- **automaticVercelMonitors: true** - автоматический мониторинг Vercel Cron Jobs (если используется Vercel)

## Что отслеживается

### Фронтенд

- ✅ JavaScript ошибки на клиенте
- ✅ Unhandled promise rejections
- ✅ Ошибки из Error Boundary (`app/error.tsx`)
- ✅ Глобальные ошибки React (`app/global-error.tsx`)
- ✅ Критические ошибки API (статус >= 500)
- ✅ Performance Monitoring (трейсы навигации и запросов)
  - Автоматическая инструментация: page loads, navigations, fetch requests
  - Web Vitals: LCP, INP, CLS, FCP, TTFB
  - Distributed tracing для запросов к собственному API
- ✅ Session Replay (записи сессий с ошибками)
- ✅ Structured Logs (логирование через `Sentry.logger`)
- ✅ Console ошибки и предупреждения (через `consoleLoggingIntegration`)
- ✅ Metrics (счетчики, датчики, распределения)

### Бэкенд

- ✅ Ошибки сервера (статус >= 500)
- ✅ Unhandled exceptions
- ✅ Performance Monitoring (трейсы HTTP запросов)
  - Автоматическая инструментация: API routes, Server Components
- ✅ Profiling (профилирование производительности)
- ✅ Контекст запросов (метод, путь, пользователь)
- ✅ Structured Logs (логирование через `Sentry.logger`)
- ✅ Metrics (счетчики, датчики, распределения)
- ✅ Cron Jobs Monitoring (мониторинг периодических задач)

## Performance Tracing

Sentry автоматически инструментирует большинство операций для трейсинга производительности.

### Что отслеживается автоматически

**Клиент:**
- Загрузка страниц и навигация
- Fetch запросы к собственному API
- Web Vitals (LCP, INP, CLS, FCP, TTFB)

**Сервер:**
- API routes (`route.ts`)
- Server Components
- `getServerSideProps`

**Edge:**
- Middleware
- Edge API routes

### Server Actions (если используются)

Server Actions требуют ручной инструментации. Если в проекте используются Server Actions, оберните их:

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

export async function myServerAction(formData: FormData) {
  return Sentry.withServerActionInstrumentation(
    "myServerAction",
    { headers: await headers() },
    async () => {
      // Ваша логика
    },
  );
}
```

### Кастомная инструментация

Используйте `startSpan` для измерения бизнес-операций:

```typescript
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  return Sentry.startSpan(
    { name: "checkout.process", op: "checkout" },
    async () => {
      const cart = await Sentry.startSpan(
        { name: "checkout.validate_cart", op: "validation" },
        () => validateCart(request),
      );

      const payment = await Sentry.startSpan(
        { name: "checkout.process_payment", op: "payment" },
        () => processPayment(cart),
      );

      return Response.json({ orderId: payment.orderId });
    },
  );
}
```

### Добавление атрибутов к трейсам

Добавляйте данные к spans для фильтрации и отладки:

```typescript
Sentry.startSpan(
  {
    name: "order.process",
    op: "order",
    attributes: {
      "order.id": orderId,
      "order.value": cart.total,
      "order.item_count": cart.items.length,
    },
  },
  async () => {
    // Логика операции
  },
);
```

### Distributed Tracing

Трейсы автоматически распространяются для:
- `fetch()` запросов к собственному домену
- Server Actions (при использовании `withServerActionInstrumentation` с headers)

Для внешних API настройте `tracePropagationTargets` в `instrumentation-client.ts`:

```typescript
Sentry.init({
  dsn,
  tracesSampleRate: 0.1,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.yourcompany\.com/,
  ],
});
```

### Web Vitals

SDK автоматически отслеживает Web Vitals на каждой загрузке страницы:

| Метрика | Что измеряет | Порог (хорошо) |
|---------|--------------|----------------|
| **LCP** | Largest Contentful Paint — производительность загрузки | ≤ 2.5s |
| **INP** | Interaction to Next Paint — отзывчивость | ≤ 200ms |
| **CLS** | Cumulative Layout Shift — визуальная стабильность | ≤ 0.1 |
| **FCP** | First Contentful Paint — начальный рендер | ≤ 1s |
| **TTFB** | Time to First Byte — ответ сервера | ≤ 100ms |

Web Vitals отображаются как измерения на транзакциях загрузки страниц и влияют на Performance Score в Sentry.

## Использование Metrics

Sentry Metrics позволяет отправлять счетчики, датчики и распределения из приложения в Sentry. Метрики можно просматривать вместе с ошибками и фильтровать по атрибутам.

**Требования:** SDK версии 10.25.0+ (установлена версия 10.37.0 ✅)

### Типы метрик

| Тип | Использование |
|-----|---------------|
| `count` | События (заказы, клики, API вызовы) |
| `gauge` | Текущие значения (глубина очереди, соединения) |
| `distribution` | Диапазоны значений (время ответа, размер данных) |

### Базовое использование

```typescript
import * as Sentry from '@sentry/nextjs';

// Счетчик событий
Sentry.metrics.count('orders_created', 1);

// Текущее значение
Sentry.metrics.gauge('active_connections', 42);

// Распределение значений
Sentry.metrics.distribution('api_latency', 187, {
  unit: 'millisecond',
});
```

### Атрибуты для фильтрации

Используйте атрибуты для фильтрации и группировки метрик:

```typescript
Sentry.metrics.count('api_calls', 1, {
  attributes: {
    endpoint: '/api/orders',
    user_tier: 'pro',
    region: 'us-west',
    user_id: user.id,
    order_id: order.id,
  },
});
```

**Важно:** Каждая метрика имеет лимит размера 2KB. При превышении метрика будет отброшена.

### Scope Attributes (SDK 10.33.0+)

Устанавливайте атрибуты через scope для автоматического добавления ко всем метрикам:

```typescript
Sentry.getGlobalScope().setAttributes({
  is_admin: true,
  auth_provider: 'google',
});

Sentry.withScope((scope) => {
  scope.setAttribute('step', 'authentication');

  // Все атрибуты scope будут добавлены
  Sentry.metrics.count('clicks', 1);
  Sentry.metrics.gauge('time_since_refresh', 4, { unit: 'hour' });
});
```

### Units

Указывайте единицы измерения для `gauge` и `distribution`:

```typescript
Sentry.metrics.distribution('response_time', 187.5, {
  unit: 'millisecond',
});

Sentry.metrics.gauge('memory_usage', 1024, {
  unit: 'byte',
});
```

Доступные единицы: `millisecond`, `second`, `byte`, `kilobyte`, `megabyte` и другие.

### Примеры использования

#### API Routes

```typescript
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  const start = Date.now();

  try {
    const order = await createOrder(request);

    Sentry.metrics.count('orders_created', 1, {
      attributes: { status: 'success' },
    });

    return Response.json(order);
  } catch (error) {
    Sentry.metrics.count('orders_created', 1, {
      attributes: { status: 'failed' },
    });
    throw error;
  } finally {
    Sentry.metrics.distribution('order_latency', Date.now() - start, {
      unit: 'millisecond',
    });
  }
}
```

#### Server Actions

```typescript
"use server";

import * as Sentry from '@sentry/nextjs';

export async function submitCheckout(formData: FormData) {
  Sentry.metrics.count('checkout_attempts', 1);

  try {
    const result = await processCheckout(formData);
    Sentry.metrics.count('checkout_success', 1);
    return result;
  } catch (error) {
    Sentry.metrics.count('checkout_failures', 1);
    throw error;
  }
}
```

#### Middleware / Proxy

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function proxy(request: NextRequest) {
  Sentry.metrics.count('requests', 1, {
    attributes: {
      path: request.nextUrl.pathname,
      method: request.method,
    },
  });

  return NextResponse.next();
}
```

### Фильтрация метрик

Используйте `beforeSendMetric` для фильтрации или модификации метрик:

```typescript
Sentry.init({
  dsn,
  beforeSendMetric: (metric) => {
    // Отбросить конкретную метрику
    if (metric.name === 'debug_metric') {
      return null;
    }

    // Добавить атрибуты
    metric.attributes = {
      ...metric.attributes,
      processed: true,
    };

    return metric;
  },
});
```

### Отключение метрик

Установите `enableMetrics: false` для полного отключения:

```typescript
Sentry.init({
  dsn,
  enableMetrics: false,
});
```

### Немедленная отправка

Метрики буферизуются и отправляются периодически. Для немедленной отправки:

```typescript
await Sentry.flush();
```

### Автоматические атрибуты

Sentry автоматически добавляет следующие атрибуты к каждой метрике:

- `sentry.environment` - окружение из конфигурации SDK
- `sentry.release` - версия релиза
- `sentry.sdk.name` - имя SDK
- `sentry.sdk.version` - версия SDK
- `user.id`, `user.name`, `user.email` - если пользователь установлен
- `browser.name`, `browser.version` - на клиенте
- `sentry.replay_id` - ID сессии replay на клиенте
- `server.address` - hostname сервера на сервере

## AI Agent Monitoring (опционально)

Sentry поддерживает мониторинг AI систем с полным контекстом. Можно отслеживать использование токенов, задержки, использование инструментов и частоту ошибок.

**Требования:** Tracing должен быть включен (уже настроен ✅)

### Автоматическая инструментация

SDK поддерживает автоматическую инструментацию для следующих AI библиотек:

- **Vercel AI SDK** - `vercelAIIntegration()`
- **OpenAI** - `openAIIntegration()`
- **Anthropic** - `anthropicIntegration()`
- **Google Gen AI SDK** - `googleGenAIIntegration()`
- **LangChain** - `langchainIntegration()`
- **LangGraph** - `langgraphIntegration()`

### Настройка интеграции

Добавьте интеграцию для вашей AI библиотеки в конфигурацию Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';
import { openAIIntegration } from '@sentry/nextjs';

if (dsn && isProduction) {
  Sentry.init({
    dsn,
    environment: 'production',
    tracesSampleRate: 0.1,
    integrations: [
      // ... существующие интеграции
      openAIIntegration({
        recordInputs: true,  // Записывать промпты (по умолчанию true)
        recordOutputs: true, // Записывать ответы (по умолчанию true)
      }),
    ],
  });
}
```

### Privacy Controls

Если промпты или ответы содержат чувствительные данные, отключите их запись:

```typescript
openAIIntegration({
  recordInputs: false,  // Не записывать промпты
  recordOutputs: false, // Не записывать ответы
})
```

### Ручная инструментация

Если используется библиотека без автоматической поддержки, можно вручную создать spans для мониторинга.

#### AI Request Span

Представляет запрос к LLM модели:

```typescript
import * as Sentry from '@sentry/nextjs';

const messages = [{ role: 'user', content: 'Tell me a joke' }];

await Sentry.startSpan(
  {
    op: 'gen_ai.request',
    name: 'request o3-mini',
    attributes: {
      'gen_ai.request.model': 'o3-mini',
      'gen_ai.request.messages': JSON.stringify(messages),
    },
  },
  async (span) => {
    const result = await client.chat.completions.create({
      model: 'o3-mini',
      messages,
    });

    span.setAttribute(
      'gen_ai.response.text',
      JSON.stringify([result.choices[0].message.content]),
    );
    span.setAttribute('gen_ai.usage.input_tokens', result.usage.prompt_tokens);
    span.setAttribute('gen_ai.usage.output_tokens', result.usage.completion_tokens);
  },
);
```

**Ключевые атрибуты:**
- `gen_ai.request.model` (required) - имя модели
- `gen_ai.request.messages` - промпты, отправленные в LLM
- `gen_ai.response.text` - ответ модели
- `gen_ai.usage.input_tokens` / `output_tokens` - количество токенов

#### Invoke Agent Span

Представляет выполнение AI агента:

```typescript
await Sentry.startSpan(
  {
    op: 'gen_ai.invoke_agent',
    name: 'invoke_agent Weather Agent',
    attributes: {
      'gen_ai.request.model': 'o3-mini',
      'gen_ai.agent.name': 'Weather Agent',
    },
  },
  async (span) => {
    const result = await myAgent.run();

    span.setAttribute('gen_ai.response.text', JSON.stringify([result.output]));
    span.setAttribute('gen_ai.usage.input_tokens', result.usage.inputTokens);
    span.setAttribute('gen_ai.usage.output_tokens', result.usage.outputTokens);
  },
);
```

#### Execute Tool Span

Представляет выполнение инструмента, запрошенного AI моделью:

```typescript
await Sentry.startSpan(
  {
    op: 'gen_ai.execute_tool',
    name: 'execute_tool get_weather',
    attributes: {
      'gen_ai.tool.name': 'get_weather',
      'gen_ai.tool.input': JSON.stringify({ location: 'Paris' }),
    },
  },
  async (span) => {
    const result = await getWeather({ location: 'Paris' });
    span.setAttribute('gen_ai.tool.output', JSON.stringify(result));
  },
);
```

#### Handoff Span

Отмечает переход управления от одного агента к другому:

```typescript
await Sentry.startSpan(
  {
    op: 'gen_ai.handoff',
    name: 'handoff from Weather Agent to Travel Agent',
  },
  () => {}, // Handoff span просто отмечает переход
);

await Sentry.startSpan(
  { op: 'gen_ai.invoke_agent', name: 'invoke_agent Travel Agent' },
  async () => {
    // Запуск целевого агента
  },
);
```

### Общие атрибуты

Все AI spans должны включать следующие атрибуты:

| Атрибут | Тип | Требование | Описание |
|---------|-----|------------|----------|
| `gen_ai.request.model` | string | required | Имя AI модели |
| `gen_ai.operation.name` | string | optional | Название операции |
| `gen_ai.agent.name` | string | optional | Имя агента |

### Дополнительная информация

- [AI Agent Monitoring Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/ai-agent-monitoring/)
- [MCP Server Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/instrumentation/mcp-module.md)

## Использование Structured Logs

Sentry поддерживает структурированное логирование для быстрой отладки.

### Базовое использование

```typescript
import * as Sentry from '@sentry/nextjs';

// Разные уровни логов
Sentry.logger.trace('Entering function', { fn: 'processOrder' });
Sentry.logger.debug('Cache lookup', { key: 'user:123' });
Sentry.logger.info('Order created', { order_id: 'order_456' });
Sentry.logger.warn('Rate limit approaching', { current: 95, max: 100 });
Sentry.logger.error('Payment failed', { reason: 'card_declined' });
Sentry.logger.fatal('Database unavailable', { host: 'primary' });
```

### Параметризованные сообщения

Используйте `fmt` для параметризованных сообщений — значения извлекаются как поисковые атрибуты:

```typescript
Sentry.logger.info(
  Sentry.logger.fmt`User ${userId} purchased ${productName}`,
);
```

### Добавление контекста

Используйте scope для автоматического добавления атрибутов ко всем логам:

```typescript
// Isolation scope - уникален для каждого запроса
Sentry.getIsolationScope().setAttributes({
  user_id: user.id,
  user_tier: user.tier,
});

// Current scope - для одной операции
Sentry.withScope((scope) => {
  scope.setAttribute('request_id', req.id);
  Sentry.logger.info('Processing order');
});
```

### Best Practices

1. **Широкие события вместо множества тонких логов** — один лог с полным контекстом лучше, чем много разрозненных
2. **Включайте бизнес-контекст** — user tier, order value, feature flags
3. **Используйте snake_case** для имен атрибутов для консистентности

Пример хорошего лога:

```typescript
Sentry.logger.info('Checkout completed', {
  order_id: order.id,
  user_id: user.id,
  user_tier: user.subscription,
  cart_value: cart.total,
  item_count: cart.items.length,
  payment_method: 'stripe',
  duration: Date.now() - startTime,
});
```

## Troubleshooting

### Логи не появляются в Sentry

Убедитесь, что `enableLogs: true` установлено во всех трех конфигурационных файлах:
- `instrumentation-client.ts` (клиент)
- `sentry.server.config.ts` (сервер)
- `sentry.edge.config.ts` (edge)

### Логи отфильтровываются

Если атрибуты показывают `[Filtered]`, они удаляются серверной фильтрацией данных Sentry. Проверьте настройки data scrubbing в проекте.

### Высокий объем трейсов

Если отправляется слишком много трейсов, снизьте sample rate или используйте `tracesSampler` для динамической выборки:

```typescript
Sentry.init({
  tracesSampler: ({ name }) => {
    // 5% health checks
    if (name.includes("health")) return 0.05;
    // 50% API routes
    if (name.includes("/api/")) return 0.5;
    // 10% по умолчанию
    return 0.1;
  },
});
```

## Cron Jobs Monitoring

Sentry позволяет мониторить периодические задачи (cron jobs) для получения алертов и метрик, помогающих решать ошибки, обнаруживать таймауты и предотвращать сбои сервиса.

**Требования:** SDK версии 7.51.1+ (установлена версия 10.37.0 ✅)

### Автоматический мониторинг Vercel Cron Jobs

Если приложение размещено на Vercel и используются [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs), мониторинг уже настроен автоматически через `automaticVercelMonitors: true` в `next.config.js`.

**Примечание:** Автоматическая инструментация Vercel cron jobs работает только для Pages Router. App Router route handlers пока не поддерживаются.

### Мониторинг NestJS Cron Jobs

В проекте используются NestJS cron jobs через `@nestjs/schedule`. Для их мониторинга можно использовать `Sentry.withMonitor()`:

```typescript
import * as Sentry from '@sentry/node';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ListingsService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseOldListings(): Promise<{ closed: number }> {
    return Sentry.withMonitor(
      'auto-close-old-listings',
      async () => {
        // Существующая логика закрытия объявлений
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        // ... остальная логика
      },
      {
        schedule: {
          type: 'crontab',
          value: '0 0 * * *', // Каждый день в полночь
        },
        checkinMargin: 5, // 5 минут grace period
        maxRuntime: 30, // Максимальное время выполнения 30 минут
      },
    );
  }
}
```

### Мониторинг внешних Cron Endpoints

Для close-old-listings используется только in-process cron (`auto-close-old-listings` в ListingsService). Endpoint `POST /listings/cron/close-old` оставлен для опционального вызова извне, но без Sentry monitor — в Sentry монитор `close-old-listings-endpoint` можно удалить.

Для других внешних cron endpoints используйте `Sentry.withMonitor()` или `Sentry.captureCheckIn()`:

#### Вариант 1: withMonitor (рекомендуется)

```typescript
import * as Sentry from '@sentry/node';

@Post('cron/close-old')
async closeOldListings(@Headers('x-cron-secret') secret: string) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    throw new ForbiddenException('Invalid secret key');
  }

  return Sentry.withMonitor(
    'close-old-listings-endpoint',
    async () => {
      const result = await this.listingsService.autoCloseOldListings();
      return { message: 'Old listings closed successfully', result };
    },
    {
      schedule: {
        type: 'crontab',
        value: '0 0 * * *',
      },
      checkinMargin: 5,
      maxRuntime: 30,
    },
  );
}
```

#### Вариант 2: Check-Ins (для более детального контроля)

```typescript
import * as Sentry from '@sentry/node';

@Post('cron/close-old')
async closeOldListings(@Headers('x-cron-secret') secret: string) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    throw new ForbiddenException('Invalid secret key');
  }

  const monitorConfig = {
    schedule: {
      type: 'crontab',
      value: '0 0 * * *',
    },
    checkinMargin: 5,
    maxRuntime: 30,
  };

  // Уведомляем Sentry, что задача началась
  const checkInId = Sentry.captureCheckIn(
    {
      monitorSlug: 'close-old-listings-endpoint',
      status: 'in_progress',
    },
    monitorConfig,
  );

  try {
    const result = await this.listingsService.autoCloseOldListings();

    // Уведомляем Sentry об успешном завершении
    Sentry.captureCheckIn(
      {
        checkInId,
        monitorSlug: 'close-old-listings-endpoint',
        status: 'ok',
      },
      monitorConfig,
    );

    return { message: 'Old listings closed successfully', result };
  } catch (error) {
    // Уведомляем Sentry об ошибке
    Sentry.captureCheckIn(
      {
        checkInId,
        monitorSlug: 'close-old-listings-endpoint',
        status: 'error',
      },
      monitorConfig,
    );
    throw error;
  }
}
```

### Heartbeat мониторинг

Если нужно только отслеживать, что задача запустилась (без проверки времени выполнения), используйте heartbeat:

```typescript
@Post('cron/close-old')
async closeOldListings(@Headers('x-cron-secret') secret: string) {
  // ... проверка секрета ...

  try {
    const result = await this.listingsService.autoCloseOldListings();

    // Уведомляем Sentry об успешном завершении
    Sentry.captureCheckIn({
      monitorSlug: 'close-old-listings-endpoint',
      status: 'ok',
    });

    return { message: 'Old listings closed successfully', result };
  } catch (error) {
    Sentry.captureCheckIn({
      monitorSlug: 'close-old-listings-endpoint',
      status: 'error',
    });
    throw error;
  }
}
```

### Конфигурация Monitor

Доступные параметры конфигурации:

- **`schedule`** - расписание задачи:
  - `{ type: "crontab", value: "0 * * * *" }` - cron выражение
  - `{ type: "interval", value: "2", unit: "hour" }` - интервал
- **`checkinMargin`** - время ожидания check-in в минутах перед пометкой как "missed" (опционально)
- **`maxRuntime`** - максимальное время выполнения в минутах (опционально)
- **`timezone`** - часовой пояс (например, `"America/Los_Angeles"`) (опционально)
- **`failureIssueThreshold`** - количество последовательных неудачных check-ins для создания issue (SDK 8.7.0+, опционально)
- **`recoveryThreshold`** - количество последовательных успешных check-ins для разрешения issue (SDK 8.7.0+, опционально)

### Создание Alerts

Для получения уведомлений о проблемах с cron jobs:

1. Перейдите в **Alerts** в боковой панели Sentry
2. Создайте новый alert и выберите "Issues" под "Errors"
3. Настройте фильтр: `The event's tags match monitor.slug equals <monitor-slug>`

Пример: `The event's tags match monitor.slug equals close-old-listings-endpoint`

### Rate Limits

Sentry ограничивает check-ins до **6 в минуту для каждого monitor environment**. Проверьте [Usage Stats](https://docs.sentry.io/product/stats.md#usage-stats) для отслеживания отброшенных check-ins.

### Существующие Cron Jobs в проекте

В проекте используются следующие cron jobs:

1. **`autoCloseOldListings`** - закрытие старых объявлений (каждый день в полночь)
2. **IP Block cleanup** - очистка истекших IP блоков (каждый час)
3. **Refresh Token cleanup** - очистка истекших refresh токенов (каждый день в 2:00)

Все они могут быть обернуты в `Sentry.withMonitor()` для мониторинга.

## Полезные ссылки

- [Sentry Dashboard](https://sentry.io)
- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Manual Setup Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Logs Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [Crons Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/crons/)
