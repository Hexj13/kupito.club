# Sentry Launch Checklist - Готовность к запуску рекламы

## ✅ Что уже настроено

### Базовый мониторинг
- ✅ **Ошибки** - автоматический сбор JavaScript ошибок, unhandled rejections, API ошибки (>= 500)
- ✅ **Performance Tracing** - 10% трейсов на клиенте, 100% на сервере
- ✅ **Session Replay** - записи всех сессий с ошибками (100%), 10% всех сессий
- ✅ **Structured Logs** - включены для всех runtime
- ✅ **Metrics** - включены по умолчанию

### Cron Jobs Мониторинг
- ✅ **auto-close-old-listings** - мониторинг автоматического закрытия старых объявлений
- ✅ **ip-block-cleanup** - мониторинг очистки IP блоков (каждый час)
- ✅ **refresh-token-cleanup** - мониторинг очистки истекших токенов (каждый день в 2:00)
- ✅ **close-old-listings-endpoint** - мониторинг внешнего cron endpoint

### Бизнес-метрики
- ✅ **users.registered** - счетчик регистраций (с атрибутами: user_type, has_email, has_phone)
- ✅ **listings.created** - счетчик создания объявлений (с атрибутами: status, currency, vehicle_type, is_promoted)
- ✅ **listings.searches** - счетчик поисковых запросов (с атрибутами: has_filters, results_count, page, vehicle_type)

## 📋 Что нужно сделать перед запуском

### 1. Проверка переменных окружения (КРИТИЧНО)

Убедитесь, что в production установлены все необходимые переменные:

**Frontend:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=kupitoclub
SENTRY_PROJECT=kupito-frontend
SENTRY_AUTH_TOKEN=xxx
```

**Backend:**
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

### 2. Создание Monitors в Sentry Dashboard

После первого деплоя создайте monitors для cron jobs в Sentry:

1. Перейдите в **Alerts** → **Crons** → **Create Monitor**
2. Создайте monitors для:
   - `auto-close-old-listings` (schedule: `0 0 * * *`)
   - `ip-block-cleanup` (schedule: каждый час)
   - `refresh-token-cleanup` (schedule: `0 2 * * *`)
   - `close-old-listings-endpoint` (schedule: `0 0 * * *`)

Или они создадутся автоматически при первом выполнении (если используется `withMonitor` с конфигурацией).

### 3. Настройка Alerts (ВАЖНО)

Настройте уведомления о критичных проблемах:

1. **Alerts** → **Create Alert**
2. Выберите "Issues" под "Errors"
3. Настройте фильтры:
   - `The event's tags match monitor.slug equals auto-close-old-listings` - для cron jobs
   - `The event's level equals error` - для всех ошибок
   - `The event's tags match httpStatus equals 500` - для серверных ошибок

4. Выберите способ уведомления (email, Slack, Discord и т.д.)

### 4. Проверка после деплоя

После деплоя в production проверьте:

1. **Sentry Dashboard** → **Issues** - должны появиться тестовые события (если есть)
2. **Performance** → **Transactions** - должны появиться трейсы
3. **Metrics** → проверьте, что метрики поступают:
   - `users.registered`
   - `listings.created`
   - `listings.searches`
4. **Crons** → проверьте, что monitors созданы и работают

## 🎯 Что отслеживать после запуска рекламы

### Критичные метрики для мониторинга:

1. **Ошибки:**
   - Частота ошибок (должна быть < 1% запросов)
   - Критичные ошибки (500, unhandled exceptions)
   - Ошибки регистрации/создания объявлений

2. **Performance:**
   - Время ответа API (должно быть < 500ms для 95% запросов)
   - Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)
   - Медленные запросы (> 1s)

3. **Бизнес-метрики:**
   - `users.registered` - количество регистраций
   - `listings.created` - количество созданных объявлений
   - `listings.searches` - количество поисковых запросов
   - Соотношение регистраций к поискам

4. **Cron Jobs:**
   - Успешность выполнения всех cron jobs
   - Время выполнения (не должно превышать maxRuntime)
   - Пропущенные выполнения (missed check-ins)

## 📊 Рекомендации по оптимизации

### Если трафик высокий:

1. **Снизить sample rates:**
   - Client traces: уже 10% (хорошо)
   - Server traces: можно снизить до 0.1-0.2 если нужно
   - Session Replay: можно снизить до 0.05 (5%)

2. **Настроить динамический sampling:**
   ```typescript
   tracesSampler: ({ name }) => {
     if (name.includes("health")) return 0.05;
     if (name.includes("/api/")) return 0.5;
     return 0.1;
   }
   ```

3. **Фильтрация метрик:**
   - Используйте `beforeSendMetric` для фильтрации неважных метрик

### Если трафик низкий:

- Можно увеличить sample rates для более детального анализа
- Включить больше session replays для анализа UX

## 🚨 Критичные проблемы, на которые нужно обратить внимание

1. **Высокая частота ошибок (> 5%)** - срочно исправить
2. **Медленные запросы (> 2s)** - оптимизировать
3. **Пропущенные cron jobs** - проверить расписание и доступность сервера
4. **Ошибки регистрации** - критично для бизнеса
5. **Ошибки создания объявлений** - критично для бизнеса

## 📝 Дополнительные улучшения (можно сделать позже)

1. **Добавить больше метрик:**
   - Просмотры объявлений
   - Клики по контактам
   - Конверсии (регистрация после просмотра)

2. **Добавить structured logs для ключевых операций:**
   - Детальное логирование процесса регистрации
   - Логирование создания объявлений с полным контекстом

3. **Настроить custom dashboards** в Sentry для визуализации метрик

## ✅ Итоговый чеклист перед запуском

- [ ] Все переменные окружения установлены в production
- [ ] Sentry Dashboard доступен и работает
- [ ] Тестовые события поступают в Sentry
- [ ] Monitors для cron jobs созданы (или будут созданы автоматически)
- [ ] Alerts настроены для критичных ошибок
- [ ] Команда знает, где смотреть метрики и ошибки
- [ ] Есть план действий при обнаружении критичных проблем

---

**Готово к запуску!** 🚀

Все критичные компоненты мониторинга настроены. После запуска рекламы вы будете получать полную картину о работе приложения, ошибках, производительности и бизнес-метриках.
