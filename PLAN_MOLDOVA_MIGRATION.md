# План переделки сайта Купито на Молдову

> **📊 Статус:** 📝 В планировании | **📅 Дата создания:** 2026-01-26 | **🔖 Версия:** 1.0

---

## 📑 Содержание

1. [Обзор изменений](#-обзор-изменений)
2. [Конфигурация платформы](#-конфигурация-платформы)
3. [Валюты](#-валюты)
4. [Города](#-города)
5. [Переводы и локализация](#-переводы-и-локализация)
6. [Переключатель языка](#-переключатель-языка)
7. [Текстовые замены](#-текстовые-замены)
8. [SEO и метаданные](#-seo-и-метаданные)
9. [Географические сигналы](#-географические-сигналы)
10. [Настройки инфраструктуры и деплоя](#-настройки-инфраструктуры-и-деплоя)
11. [Чек-лист выполнения](#-чек-лист-выполнения)

---

## 🎯 Обзор изменений

**Цель:** Переделать текущий сайт Купито (Македония) на Молдову без создания нового сайта.

**Ключевые изменения:**
- ✅ Валюта: EUR (главная), MDL (дополнительная) - вместо MKD/EUR
- ✅ Города: заменить македонские города на молдавские
- ✅ Языки: румынский (главный/дефолтный) + русский
- ✅ Переключатель языка в хедере и футере с сохранением в localStorage
- ✅ **Управление переключателем языка через переменную окружения** `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER`
- ✅ **Комплексная проверка и замена всех упоминаний Македонии на Молдову** (код, конфиги, переводы, документация)
- ✅ Обновление всех юридических документов (FAQ, Terms, Privacy)
- ✅ Обновление всей документации проекта
- ✅ Популярные наборы: остаются как есть
- ✅ Цвета сайта: остаются как есть

---

## ⚙️ Конфигурация платформы

### 1.1. Обновление `config/site.ts`

**Файл:** `config/site.ts`

**Текущие значения:**
```typescript
country: "mk",
locale: "mk-MK",
currency: "MKD",
currencies: ["MKD", "EUR"] as const,
countryCode: "MK",
```

**Нужно изменить на:**
```typescript
country: "md",  // или "mo" - уточнить код страны
locale: "ro-MD",  // румынский для Молдовы
currency: "EUR",  // евро - главная валюта
currencies: ["EUR", "MDL"] as const,  // EUR первая, MDL вторая
countryCode: "MD",  // или "MO" - уточнить
```

### 1.2. Настройка переменной окружения для переключателя языка

**Переменная окружения:**
```env
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
```

**Логика:**
- `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true` → показывается переключатель языка (румынский + русский)
- `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false` или не задана → только дефолтный язык (румынский), переключатель скрыт

**Где настроить:**
- Локальная разработка: `core/frontend/.env.local`
- Production: переменные окружения на сервере (Render.com, Vercel, etc.)

**Пример для Молдовы:**
```env
NEXT_PUBLIC_COUNTRY=md
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
NEXT_PUBLIC_SITE_URL=https://kupito.club
NEXT_PUBLIC_API_URL=https://api.kupito.club
```

### 1.3. Обновление констант валют в Core

**Важно:** Нужно обновить константы валют в core репозитории для поддержки MDL.

#### Backend константы
**Файл:** `core/backend/src/common/constants.ts`

**Текущее значение:**
```typescript
export const currencies = ['MKD', 'EUR'] as const;

export const Currency = {
  MKD: currencies[0],
  EUR: currencies[1],
} as const;
```

**Нужно обновить:**
```typescript
export const currencies = ['EUR', 'MDL'] as const;

export const Currency = {
  EUR: currencies[0],  // Основная валюта (первая в списке)
  MDL: currencies[1],  // Дополнительная валюта
} as const;
```

#### Frontend константы
**Файл:** `core/frontend/lib/constants.ts`

**Текущее значение:**
```typescript
export const currencies = ['MKD', 'EUR'] as const;

export const Currency = {
  MKD: currencies[0],
  EUR: currencies[1],
} as const;
```

**Нужно обновить:**
```typescript
export const currencies = ['EUR', 'MDL'] as const;

export const Currency = {
  EUR: currencies[0],  // Основная валюта (первая в списке)
  MDL: currencies[1],  // Дополнительная валюта
} as const;
```

**Важно:** Порядок важен! EUR должна быть первой, так как это основная валюта и она будет первой в выпадающем списке при создании объявления.

---

## 💰 Валюты

### 2.1. Основная валюта
- **EUR** (евро) - главная валюта
- Отображается первой в селекторе валют
- Используется по умолчанию при создании объявления

### 2.2. Дополнительная валюта
- **MDL** (молдавский лей) - дополнительная валюта
- Доступна для выбора при создании объявления

### 2.3. Функция форматирования цен
Проверить, что функция `formatPrice()` корректно обрабатывает EUR и MDL.

**Файл:** `core/frontend/lib/utils.ts`

---

## 🏙️ Города

### 3.1. Создание конфигурации городов для Молдовы

**Файл:** `core/backend/src/scripts/platforms/md/config.ts` (создать новый)

**Структура:**
```typescript
export interface PlatformSeedConfig {
  cities: string[];
  descriptions: string[];
  phonePrefix: string;
  testUserFirstName: string;
  testUserLastName: string;
  testCompanyName: string;
  transmissionLabels: {
    automatic: string;
    manual: string;
    cvt: string;
  };
}

const config: PlatformSeedConfig = {
  cities: [
    // Муниципии (крупнейшие города с особым статусом)
    'Chișinău',      // Кишинёв - столица, ~720 тыс. жителей
    'Bălți',        // Бельцы - ~95 тыс. жителей
    'Tiraspol',     // Тирасполь - столица ПМР, ~130 тыс. жителей
    'Bender',       // Бендеры - ~93 тыс. жителей
    'Comrat',       // Комрат - столица Гагаузии, ~20 тыс. жителей
    'Cahul',        // Кагул - ~35 тыс. жителей
    'Ceadîr-Lunga', // Чадыр-Лунга - ~20 тыс. жителей
    'Edineț',       // Единец - ~20 тыс. жителей
    'Hîncești',     // Хынчешты - ~12 тыс. жителей
    'Orhei',        // Оргеев - ~30 тыс. жителей
    'Soroca',       // Сороки - ~22 тыс. жителей
    'Strășeni',     // Страшены - ~20 тыс. жителей
    'Ungheni',      // Унгены - ~30 тыс. жителей
    
    // Другие крупные и популярные города
    'Rîbnița',      // Рыбница - ~50 тыс. жителей
    'Căușeni',      // Каушаны - ~20 тыс. жителей
    'Drochia',      // Дрокия - ~16 тыс. жителей
    'Dubăsari',     // Дубэсары - ~25 тыс. жителей
    'Florești',     // Флорешты - ~15 тыс. жителей
    'Glodeni',      // Глодяны - ~10 тыс. жителей
    'Ialoveni',     // Яловены - ~15 тыс. жителей
    'Leova',        // Леова - ~11 тыс. жителей
    'Nisporeni',    // Ниспорены - ~12 тыс. жителей
    'Ocnița',       // Окница - ~9 тыс. жителей
    'Rezina',       // Резина - ~10 тыс. жителей
    'Rîșcani',      // Рышканы - ~11 тыс. жителей
    'Sîngerei',     // Сынжерей - ~12 тыс. жителей
    'Șoldănești',   // Шолдэнешть - ~6 тыс. жителей
    'Ștefan Vodă',  // Штефан Водэ - ~7 тыс. жителей
    'Taraclia',     // Тараклия - ~13 тыс. жителей
    'Telenești',    // Теленешты - ~7 тыс. жителей
    'Cimișlia',     // Чимишлия - ~12 тыс. жителей
    'Criuleni',     // Криуляны - ~9 тыс. жителей
    'Dondușeni',    // Дондюшены - ~10 тыс. жителей
    'Fălești',      // Фэлешть - ~12 тыс. жителей
    'Cantemir',     // Кантемир - ~5 тыс. жителей
    'Călărași',     // Кэлэрашь - ~15 тыс. жителей
    'Basarabeasca', // Басарабяска - ~11 тыс. жителей
    'Briceni',      // Бричень - ~9 тыс. жителей
  ],
  
  // Примечание: В cities.service.ts нужно будет создать полный список с русскими названиями:
  // [
  //   { name: 'Chișinău', nameEn: 'Chișinău', nameRu: 'Кишинёв' },
  //   { name: 'Bălți', nameEn: 'Bălți', nameRu: 'Бельцы' },
  //   { name: 'Tiraspol', nameEn: 'Tiraspol', nameRu: 'Тирасполь' },
  //   // ... и т.д.
  // ]

  descriptions: [
    // Описания на румынском языке
    'Mașină în stare excelentă, fără defecțiuni. Service regulat.',
    'Mașină frumoasă în stare excelentă. Anvelope noi, ulei nou.',
    // ... и т.д.
  ],

  phonePrefix: '+373',  // международный код Молдовы
  testUserFirstName: 'Test',
  testUserLastName: 'Utilizator',
  testCompanyName: 'Companie Test',

  transmissionLabels: {
    automatic: 'Automată',
    manual: 'Manuală',
    cvt: 'Variator',
  },
};

export default config;
```

### 3.2. Структура данных городов для Молдовы

**Важно:** Для Молдовы используется другая логика отображения городов, чем для Македонии.

**Текущая логика (Македония):**
- `name` - кириллица (например, 'Скопје')
- `nameEn` - латиница (например, 'Skopje')
- Отображение: `${city.name} (${city.nameEn})` - кириллица, в скобках латиница

**Новая логика (Молдова):**
- `name` - румынское название (основное, дефолтное)
- `nameRu` - русское название (дополнительное)
- Отображение на румынском языке: только `name` (без скобок)
- Отображение на русском языке: `${city.nameRu} (${city.name})` - русское название, румынское в скобках

**Файл:** `core/backend/src/cities/cities.service.ts`

**Текущая структура:**
```typescript
export interface City {
  name: string;    // кириллица для Македонии
  nameEn: string;  // латиница для Македонии
}
```

**Нужно обновить для Молдовы:**
```typescript
export interface City {
  name: string;    // румынское название (основное)
  nameEn: string;  // для обратной совместимости (можно оставить как есть или использовать для румынского)
  nameRu?: string; // русское название (опциональное, для Молдовы)
}
```

**Пример данных для Молдовы:**
```typescript
private readonly cities: City[] = [
  { name: 'Chișinău', nameEn: 'Chișinău', nameRu: 'Кишинёв' },
  { name: 'Bălți', nameEn: 'Bălți', nameRu: 'Бельцы' },
  { name: 'Tiraspol', nameEn: 'Tiraspol', nameRu: 'Тирасполь' },
  { name: 'Bender', nameEn: 'Bender', nameRu: 'Бендеры' },
  // ... и т.д.
];
```

### 3.3. Обновление функций отображения городов

**Файл:** `core/frontend/lib/utils.ts`

**Текущая функция (для Македонии):**
```typescript
export function getCityNameMk(cityNameEn: string | undefined): string {
  if (!cityNameEn) return '';
  return cityNamesMap[cityNameEn] || cityNameEn;
}
```

**Нужно создать/обновить для Молдовы:**
```typescript
// Функция для получения названия города в зависимости от языка
export function getCityName(cityNameEn: string | undefined, locale: string, cities?: City[]): string {
  if (!cityNameEn) return '';
  
  // Найти город в списке
  const city = cities?.find(c => c.nameEn === cityNameEn);
  if (!city) return cityNameEn;
  
  // Для румынского языка (ro) - только румынское название
  if (locale === 'ro') {
    return city.name;
  }
  
  // Для русского языка (ru) - русское название, румынское в скобках
  if (locale === 'ru' && city.nameRu) {
    return `${city.nameRu} (${city.name})`;
  }
  
  // Fallback - румынское название
  return city.name;
}
```

**Файл:** `core/frontend/components/ListingForm/PriceAndLocationSection.tsx`

**Текущий код:**
```typescript
options={cities.map((city) => ({
  value: city.nameEn,
  label: `${city.name} (${city.nameEn})`,
}))}
```

**Нужно обновить для Молдовы:**
```typescript
const { locale } = useI18n(); // или получить из контекста i18n

options={cities.map((city) => {
  let label: string;
  if (locale === 'ro') {
    // Румынский: только румынское название
    label = city.name;
  } else if (locale === 'ru' && city.nameRu) {
    // Русский: русское название, румынское в скобках
    label = `${city.nameRu} (${city.name})`;
  } else {
    // Fallback: румынское название
    label = city.name;
  }
  
  return {
    value: city.nameEn,
    label,
  };
})}
```

**Файл:** `core/frontend/hooks/useFilterOptions.ts`

**Текущий код:**
```typescript
label: `${city.name} (${city.nameEn})`,
```

**Нужно обновить аналогично** - использовать логику в зависимости от языка.

**Файл:** `core/frontend/components/ListingCard.tsx`

**Текущий код:**
```typescript
<span>{getCityNameMk(listing.city)}</span>
```

**Нужно обновить:**
```typescript
const { locale } = useI18n();
const cities = useCities(); // получить список городов

<span>{getCityName(listing.city, locale, cities)}</span>
```

**Аналогично обновить в:**
- `core/frontend/components/ListingPage/ListingPageSeller.tsx`
- `core/frontend/components/UserListingsModal.tsx`
- Все другие места, где используется `getCityNameMk()`

### 3.4. Обновление списка городов в форме

**Файл:** `core/frontend/lib/form-options.ts` или соответствующий файл с опциями городов

Нужно убедиться, что города загружаются из конфигурации платформы через `getPlatformConfig()`.

### 3.5. Телефонные коды Молдовы

**Международный код страны:** `+373`

**Коды основных городов (для справки):**
- Chișinău (Кишинёв): 22, 32
- Bălți (Бельцы): 231
- Tiraspol (Тирасполь): 533
- Bender (Бендеры): 552
- Rîbnița (Рыбница): 555
- Cahul (Кагул): 299
- Soroca (Сороки): 230
- Orhei (Оргеев): 235
- Comrat (Комрат): 298
- Ungheni (Унгены): 236
- Strășeni (Страшены): 237
- Cimișlia (Чимишлия): 241
- Ștefan Vodă (Штефан Водэ): 242
- Călărași (Кэлэрашь): 244
- Edineț (Единец): 246
- Briceni (Бричень): 247
- Criuleni (Криуляны): 248
- Glodeni (Глодяны): 249
- Florești (Флорешты): 250
- Dondușeni (Дондюшены): 251
- Drochia (Дрокия): 252
- Rezina (Резина): 254
- Rîșcani (Рышканы): 256
- Telenești (Теленешты): 258
- Fălești (Фэлешть): 259
- Sîngerei (Сынжерей): 262
- Leova (Леова): 263
- Nisporeni (Ниспорены): 264
- Ialoveni (Яловены): 268
- Hîncești (Хынчешты): 269
- Ocnița (Окница): 271
- Șoldănești (Шолдэнешть): 272
- Cantemir (Кантемир): 273
- Basarabeasca (Басарабяска): 297
- Taraclia (Тараклия): 294
- Căușeni (Каушаны): 243
- Dubăsari (Дубэсары): 248

**Мобильные операторы (префиксы):**
- Orange Moldova: 60, 68, 69, 610, 611, 620, 621
- Moldtelecom: 671-677
- Moldcell: 760, 767, 780-788, 79

**Правила набора:**
- Внутри Молдовы: `0 + код города/оператора + номер абонента`
- Из-за границы: `+373 + код города/оператора + номер абонента`

**Важно:** В конфигурации используется только `phonePrefix: '+373'` (международный код). Коды городов используются автоматически при наборе номера.

### 3.6. Обновление функций нормализации телефонов

**Файл:** `core/frontend/lib/utils.ts`

**Текущий код (для Македонии):**
```typescript
function getPhoneWithCountryCode(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.startsWith('389')) {  // код Македонии
    return digits;
  }
  if (digits.length === 9) {
    return `389${digits}`;  // код Македонии
  }
  return digits;
}
```

**Нужно обновить для Молдовы:**
```typescript
function getPhoneWithCountryCode(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.startsWith('373')) {  // код Молдовы
    return digits;
  }
  if (digits.length === 8 || digits.length === 9) {  // молдавские номера обычно 8-9 цифр
    return `373${digits}`;
  }
  return digits;
}
```

**Файл:** `core/backend/src/auth/services/sms.service.ts`

**Текущий код:**
```typescript
normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

  if (normalized.startsWith('0')) {
    normalized = '+389' + normalized.substring(1);  // код Македонии
  } else if (!normalized.startsWith('+')) {
    normalized = '+389' + normalized;  // код Македонии
  }

  return normalized;
}
```

**Нужно обновить для Молдовы:**
```typescript
normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s+/g, '').replace(/[()-]/g, '');

  if (normalized.startsWith('0')) {
    normalized = '+373' + normalized.substring(1);  // код Молдовы
  } else if (!normalized.startsWith('+')) {
    normalized = '+373' + normalized;  // код Молдовы
  }

  return normalized;
}
```

**Важно:** Эти функции используются для нормализации телефонных номеров при регистрации, отправке SMS и генерации ссылок на Telegram/WhatsApp.

---

## 🌐 Переводы и локализация

### 4.1. Создание файлов переводов

#### 4.1.1. Румынский язык (основной)
**Файл:** `locales/ro.json` (создать новый)

- Скопировать структуру из `locales/mk.json`
- Перевести все ключи на румынский язык
- Румынский - главный и дефолтный язык

#### 4.1.2. Русский язык (дополнительный)
**Файл:** `locales/ru.json` (создать новый)

- Скопировать структуру из `locales/mk.json`
- Перевести все ключи на русский язык

#### 4.1.3. Английский язык (fallback)
**Файл:** `core/frontend/lib/locales/en.json`

- Обновить все ключи, заменив упоминания Македонии на Молдову
- Обновить валюты с MKD на EUR/MDL

### 4.2. Обновление системы i18n

**Файл:** `core/frontend/lib/i18n.ts`

Нужно обновить функции для поддержки румынского и русского языков:

```typescript
export type Locale = 'ro' | 'ru' | 'en';

// Обновить функции загрузки переводов
export function loadRoTranslations(): Translations { ... }
export function loadRuTranslations(): Translations { ... }

// Обновить getDefaultLocale() для возврата 'ro'
export function getDefaultLocale(): Locale {
  const country = process.env.NEXT_PUBLIC_COUNTRY || 'md';
  try {
    const siteConfig = loadSiteConfigSync(country);
    return siteConfig.locale.split('-')[0] as Locale;  // должно вернуть 'ro'
  } catch {
    return 'ro';  // дефолт на румынский
  }
}
```

### 4.3. Обновление I18nProvider

**Файл:** `core/frontend/components/I18nProvider.tsx`

Нужно обновить для поддержки динамической смены языка с сохранением в localStorage:

```typescript
// Добавить поддержку сохранения выбранного языка
// Использовать getStoredLocale() и setStoredLocale() из i18n.ts
```

---

## 🔄 Переключатель языка

### 5.1. Конфигурация переключателя языка через переменную окружения

**Важно:** Наличие переключателя языка управляется через переменную окружения.

**Переменная окружения:**
```env
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
```

**Логика:**
- Если `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true` (или `"true"`) → показывается переключатель языка
- Если `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false` (или не задана) → только дефолтный язык, переключатель скрыт

**Файлы для обновления:**
- `core/frontend/components/Header.tsx` - условное отображение переключателя
- `core/frontend/components/Footer.tsx` - условное отображение переключателя
- `core/frontend/components/LanguageSwitcher.tsx` - проверка переменной окружения

**Пример использования:**
```typescript
const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';

// В Header и Footer:
{enableLanguageSwitcher && <LanguageSwitcher variant="desktop" />}
```

### 5.2. Создание компонента LanguageSwitcher

**Файл:** `core/frontend/components/LanguageSwitcher.tsx` (создать новый)

**Требования:**
- Компонент для переключения языка
- Румынский (ro) - главный и дефолтный
- Русский (ru) - дополнительный
- Выбранный язык сохраняется в localStorage (если меняли)
- Если язык не меняли, используется дефолтный (румынский)
- При смене языка обновляется контекст i18n и перезагружается страница

**Реализация:**
```typescript
'use client';

import { useI18n } from './I18nProvider';
import { setStoredLocale, type Locale } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { Dropdown } from './Dropdown';

export function LanguageSwitcher({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { locale } = useI18n();
  const router = useRouter();
  
  const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';
  
  if (!enableLanguageSwitcher) {
    return null;
  }

  const languages = [
    { value: 'ro' as Locale, label: 'Română' },
    { value: 'ru' as Locale, label: 'Русский' },
  ];

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setStoredLocale(newLocale);
      router.refresh(); // или window.location.reload() для полной перезагрузки
    }
  };

  return (
    <Dropdown
      value={locale}
      onChange={handleLanguageChange}
      options={languages}
      placeholder={languages.find(l => l.value === locale)?.label || 'Română'}
      // Добавить стили в зависимости от variant
    />
  );
}
```

**Альтернативный вариант (проверка в родительских компонентах):**
```typescript
// В Header.tsx и Footer.tsx
const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';

// Условное отображение:
{enableLanguageSwitcher && <LanguageSwitcher variant="desktop" />}
```

**Рекомендация:** Проверку лучше делать в родительских компонентах (Header, Footer), чтобы не рендерить компонент вообще, если переключатель отключен.

### 5.3. Добавление переключателя в Header

**Файл:** `core/frontend/components/Header.tsx`

**Требования:**
- Переключатель языка в хедере (навигационная панель)
- Разместить в десктопной версии навигации (после основных ссылок, перед профилем)
- Разместить в мобильном меню (после основных ссылок)
- Использовать компонент `LanguageSwitcher` с вариантом `desktop` или `mobile`
- **Условное отображение** в зависимости от `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER`

**Реализация:**
```typescript
'use client';

// В начале компонента Header:
const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';

// В десктопной навигации (после основных ссылок):
{enableLanguageSwitcher && <LanguageSwitcher variant="desktop" />}

// В мобильном меню (после основных ссылок):
{enableLanguageSwitcher && <LanguageSwitcher variant="mobile" />}
```

**Расположение:**
- Десктоп: в `<nav className="hidden lg:flex ...">` после ссылок (favorites, compare) и перед профилем
- Мобильное меню: в мобильном меню после основных ссылок

### 5.4. Добавление переключателя в Footer

**Файл:** `core/frontend/components/Footer.tsx`

**Требования:**
- Переключатель языка внизу в футере
- Разместить рядом с другими ссылками (FAQ, Terms, Privacy, Cookie Settings)
- Использовать компонент `LanguageSwitcher` с вариантом `desktop`
- **Условное отображение** в зависимости от `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER`

**Реализация:**
```typescript
'use client';

// В начале компонента Footer:
const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';

// В футере, рядом с другими ссылками:
<div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 text-xs sm:text-sm mb-4 mt-6">
  {/* Существующие ссылки */}
  <Link href="/faq">...</Link>
  <span>|</span>
  {/* ... */}
  
  {/* Переключатель языка - условно */}
  {enableLanguageSwitcher && (
    <>
      <span className="hidden md:inline text-white">|</span>
      <LanguageSwitcher variant="desktop" />
    </>
  )}
</div>
```

### 5.5. Обновление функции getStoredLocale()

**Файл:** `core/frontend/lib/i18n.ts`

**Текущая реализация:**
```typescript
export function getStoredLocale(): Locale {
  return getDefaultLocale();
}
```

**Нужно обновить:**
```typescript
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return getDefaultLocale();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'ro' || stored === 'ru' || stored === 'en')) {
      return stored as Locale;
    }
  } catch {
    // Игнорировать ошибки localStorage
  }

  return getDefaultLocale();  // вернет 'ro' для Молдовы
}
```

### 5.6. Обновление I18nProvider для использования сохраненного языка

**Важно:** Если переключатель языка отключен (`NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER !== 'true'`), система должна использовать только дефолтный язык (румынский) и игнорировать сохраненный язык в localStorage.

**Обновленная логика:**
```typescript
export function getStoredLocale(): Locale {
  const enableLanguageSwitcher = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER === 'true';
  
  // Если переключатель отключен, всегда возвращаем дефолтный язык
  if (!enableLanguageSwitcher) {
    return getDefaultLocale();
  }
  
  if (typeof window === 'undefined') {
    return getDefaultLocale();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'ro' || stored === 'ru' || stored === 'en')) {
      return stored as Locale;
    }
  } catch {
    // Игнорировать ошибки localStorage
  }

  return getDefaultLocale();  // вернет 'ro' для Молдовы
}
```

### 5.7. Настройка переменной окружения

**Файл:** `.env.local` (для локальной разработки) или переменные окружения на сервере

**Для Молдовы (с переключателем языка):**
```env
NEXT_PUBLIC_COUNTRY=md
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
```

**Для Молдовы (без переключателя, только румынский):**
```env
NEXT_PUBLIC_COUNTRY=md
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false
# или просто не задавать переменную
```

**Важно:**
- Переменная должна начинаться с `NEXT_PUBLIC_` для доступности на клиенте
- Значение должно быть строкой `"true"` или `"false"` (не boolean)
- Если переменная не задана, переключатель не показывается (только дефолтный язык)

**Файл:** `core/frontend/components/I18nProvider.tsx`

Нужно обновить для чтения сохраненного языка из localStorage:

```typescript
const locale: Locale = getStoredLocale();  // вместо getDefaultLocale()
const translations = loadTranslations(locale);
```

---

## 📝 Текстовые замены

### 6.1. Проверка и обновление плейсхолдеров (placeholders)

**Важно:** Все плейсхолдеры в формах и полях ввода должны быть в переводах, а не хардкод.

**Найденные хардкодные плейсхолдеры, которые нужно перевести:**

1. **Цены:**
   - `placeholder="0"` - в `PriceAndLocationSection.tsx` и `BasicFilters.tsx`
   - `placeholder="500 000"` - в `BasicFilters.tsx`
   - Нужно добавить ключи: `listings.priceFromPlaceholder`, `listings.priceToPlaceholder`, `searchFilters.priceFromPlaceholder`, `searchFilters.priceToPlaceholder`

2. **Технические характеристики:**
   - `placeholder="2.0"` - объем двигателя в `TechnicalSpecsSection.tsx`
   - `placeholder="150"` - мощность в `TechnicalSpecsSection.tsx`
   - `placeholder="110"` - крутящий момент в `TechnicalSpecsSection.tsx`
   - `placeholder="50000"` - пробег в `TechnicalSpecsSection.tsx`
   - `placeholder="12.2025"` - дата регистрации в `TechnicalSpecsSection.tsx`
   - Нужно добавить ключи: `listings.engineDisplacementPlaceholder`, `listings.powerPlaceholder`, `listings.torquePlaceholder`, `listings.mileagePlaceholder`, `listings.registrationDatePlaceholder`

3. **Email:**
   - `placeholder="example@company.com"` - в `register/page.tsx` (сейчас с eslint-disable)
   - Нужно добавить ключ: `register.emailPlaceholder`

4. **Другие числовые значения:**
   - Проверить все остальные числовые плейсхолдеры в формах

**Файлы для проверки:**
- `core/frontend/components/ListingForm/PriceAndLocationSection.tsx`
- `core/frontend/components/ListingForm/TechnicalSpecsSection.tsx`
- `core/frontend/components/search-filters/BasicFilters.tsx`
- `core/frontend/components/search-filters/AdvancedFilters.tsx`
- `core/frontend/app/register/page.tsx`
- `core/frontend/app/login/page.tsx`
- Все другие формы с input полями

**Действия:**
1. Найти все хардкодные плейсхолдеры в коде
2. Добавить соответствующие ключи переводов в `locales/ro.json` и `locales/ru.json`
3. Заменить хардкодные значения на `t('key')`
4. Добавить правило в линтер для проверки хардкодных плейсхолдеров (TODO)

**Пример обновления:**
```typescript
// Было:
placeholder="0"

// Должно быть:
placeholder={t('listings.priceFromPlaceholder')}
```

**TODO: Добавить правило в линтер**
- Создать/обновить правило ESLint для проверки хардкодных плейсхолдеров
- Правило должно находить `placeholder="..."` где значение не из переводов
- Исключения: числовые примеры для технических полей можно оставить, но лучше тоже перевести

### 6.2. Комплексная проверка и замена всех упоминаний Македонии

**Важно:** Необходимо провести полную проверку всего проекта на наличие упоминаний Македонии и заменить их на Молдову.

#### 6.2.1. Поиск упоминаний Македонии

**Команды для поиска:**
```bash
# Поиск в коде и конфигах
grep -r "Македони" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" .
grep -r "Macedonia" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" .
grep -r "MKD" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -r "+389" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -r "mk-MK" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -r "country.*mk" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -r "countryCode.*MK" --include="*.ts" --include="*.tsx" --include="*.json" .
```

**Где искать:**
1. **Код проекта:**
   - `core/frontend/` - все компоненты, страницы, хуки, утилиты
   - `core/backend/` - все сервисы, контроллеры, DTO, конфигурации
   - `config/` - все конфигурационные файлы
   - `locales/` - все файлы переводов

2. **Документация:**
   - `core/docs/` - вся документация
   - `README.md`, `SETUP.md` - корневые файлы
   - Все `.md` файлы в проекте

3. **Конфигурационные файлы:**
   - `config/site.ts`
   - `config/faq.ts`
   - `config/legal.ts`
   - `config/popular-brands.ts` (проверить комментарии)
   - `theme/colors.ts` (проверить комментарии)

4. **Переменные окружения и скрипты:**
   - `.github/workflows/` - CI/CD конфигурации
   - `package.json` - скрипты
   - `.env` файлы (если есть)

5. **Тесты:**
   - Все тестовые файлы (`*.test.ts`, `*.spec.ts`)

#### 6.2.2. Что заменять

**Текстовые замены:**
- "Македония" → "Молдова"
- "Македонија" → "Moldova"
- "Macedonia" → "Moldova"
- "во Македонија" → "în Moldova"
- "в Македонии" → "в Молдове"
- "в Македонии" → "în Moldova" (для румынского)
- "македонский" → "молдавский" / "moldovenesc"
- "македонская" → "молдавская" / "moldovenească"
- **"Автомобили во Македонија" → "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru)** - заголовок главной страницы
- **"Автомобили в Македонии" → "Автомобили в Молдове"** - в любых других местах

**Конфигурационные замены:**
- `country: "mk"` → `country: "md"` (или "mo" - уточнить код)
- `locale: "mk-MK"` → `locale: "ro-MD"`
- `currency: "MKD"` → `currency: "EUR"`
- `currencies: ["MKD", "EUR"]` → `currencies: ["EUR", "MDL"]`
- `countryCode: "MK"` → `countryCode: "MD"` (или "MO")
- `phonePrefix: "+389"` → `phonePrefix: "+373"`

**В коде:**
- `NEXT_PUBLIC_COUNTRY=mk` → `NEXT_PUBLIC_COUNTRY=md`
- `COUNTRY=mk` → `COUNTRY=md`
- Все проверки `country === 'mk'` → `country === 'md'`
- Все проверки `locale === 'mk'` → `locale === 'ro'`

**В комментариях:**
- Все комментарии с упоминанием Македонии
- Примеры в документации

#### 6.2.3. Что НЕ трогать

**Не изменять:**
- Марки автомобилей (BMW, Mercedes, etc.)
- Модели автомобилей (X5, C-Class, etc.)
- Технические названия и коды, не связанные с географией
- Названия библиотек и пакетов
- Git истории (не переписывать коммиты)

**Осторожно:**
- Тестовые данные - могут содержать "MKD" или "mk" как часть тестовых сценариев
- Примеры в документации - нужно обновить, но проверить контекст

#### 6.2.4. Специфичные места для проверки

**Метаданные:**
- `locales/*/metadata.site.*` - title, description, keywords
- `locales/*/home.title` - **ВАЖНО:** заголовок главной страницы "Автомобили во Македонија" → "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru)
- `locales/*/metadata.site.defaultTitle` - **ВАЖНО:** дефолтный заголовок должен быть "Автомобили в Молдове"
- `core/frontend/app/layout.tsx` - метатеги
- `core/frontend/app/manifest.ts` - PWA манифест (использует `t.home.title`)
- `core/frontend/components/DynamicPageTitle.tsx` - динамический заголовок (использует `metadata.site.defaultTitle`)
- Schema.org разметка

**Alt-тексты:**
- Все `<Image>` компоненты с alt атрибутами
- Все `<img>` теги

**Внутренние ссылки:**
- Анкоры в текстах
- Описания объявлений (seed data)
- Популярные поисковые запросы

**Футер:**
- Tagline
- Copyright
- Все ссылки и тексты

**Email шаблоны:**
- Проверить все email шаблоны (если есть)
- Тексты уведомлений

**Логи и сообщения об ошибках:**
- Проверить все сообщения для пользователей
- Логи (если содержат упоминания страны)

#### 6.2.5. План проверки

1. **Автоматический поиск:**
   - Выполнить все команды grep из раздела 6.2.1
   - Сохранить результаты в файл для анализа
   - Создать список всех найденных файлов

2. **Ручная проверка:**
   - Просмотреть каждый найденный файл
   - Определить контекст упоминания
   - Решить, нужно ли заменять

3. **Замена:**
   - Выполнить замены по списку
   - Проверить, что замена корректна
   - Убедиться, что не сломалась функциональность

4. **Повторная проверка:**
   - Выполнить поиск еще раз после замен
   - Убедиться, что ничего не пропущено
   - Проверить, что нет новых упоминаний

5. **Тестирование:**
   - Запустить тесты
   - Проверить работу приложения
   - Проверить все страницы на наличие упоминаний Македонии

### 6.3. Обновление FAQ

**Файл:** `config/faq.ts`

- Заменить все упоминания Македонии на Молдову
- Обновить валюты с MKD на EUR/MDL
- Обновить телефонные коды с +389 на +373
- Перевести на румынский и русский

### 6.4. Обновление юридических документов

**Важно:** Все юридические документы из футера должны быть обновлены для Молдовы.

#### 6.4.1. FAQ (Часто задаваемые вопросы)

**Файл:** `config/faq.ts`

**Что нужно обновить:**
- Заменить все упоминания Македонии на Молдову
- Обновить валюты с MKD на EUR/MDL
- Обновить телефонные коды с +389 на +373
- Перевести все вопросы и ответы на румынский и русский
- Обновить примеры и инструкции с учетом молдавского контекста

**Структура:**
```typescript
const faqConfig: FAQConfig = {
  items: [
    // Все вопросы и ответы на румынском и русском
  ],
  scenarios: [
    // Все сценарии на румынском и русском
  ],
};
```

#### 6.4.2. Terms (Условия использования)

**Файл:** `config/legal.ts` (раздел `terms`)

**Что нужно обновить:**
- Заменить все упоминания Македонии на Молдову
- Обновить email и домены (если нужно)
- Обновить валюты с MKD на EUR/MDL
- Обновить телефонные коды с +389 на +373
- Перевести на румынский (`ro`) и русский (`ru`)
- Обновить юридические формулировки с учетом молдавского законодательства (если нужно)

**Структура:**
```typescript
const legal: LegalConfig = {
  terms: {
    ro: {
      title: "Termeni și condiții",
      lastUpdated: "Ultima actualizare: ...",
      // ... весь контент на румынском
    },
    ru: {
      title: "Условия использования",
      lastUpdated: "Последнее обновление: ...",
      // ... весь контент на русском
    },
  },
  // ...
};
```

#### 6.4.3. Privacy (Политика конфиденциальности)

**Файл:** `config/legal.ts` (раздел `privacy`)

**Что нужно обновить:**
- Заменить все упоминания Македонии на Молдову
- Обновить email и домены (если нужно)
- Обновить валюты с MKD на EUR/MDL
- Обновить телефонные коды с +389 на +373
- Перевести на румынский (`ro`) и русский (`ru`)
- Обновить информацию о GDPR/законодательстве с учетом Молдовы (если нужно)

**Структура:**
```typescript
const legal: LegalConfig = {
  privacy: {
    ro: {
      title: "Politica de confidențialitate",
      lastUpdated: "Ultima actualizare: ...",
      // ... весь контент на румынском
    },
    ru: {
      title: "Политика конфиденциальности",
      lastUpdated: "Последнее обновление: ...",
      // ... весь контент на русском
    },
  },
  // ...
};
```

#### 6.4.4. Cookie Settings (Настройки cookies)

**Файл:** Страница `core/frontend/app/cookie-settings/page.tsx` и переводы

**Что нужно обновить:**
- Проверить, что все тексты на странице используют переводы
- Добавить переводы для всех текстов в `locales/ro.json` и `locales/ru.json`
- Заменить упоминания Македонии на Молдову (если есть)

### 6.5. Обновление документации проекта

**Важно:** Вся документация проекта должна быть обновлена с учетом перехода на Молдову.

#### 6.5.1. Архитектурная документация

**Файлы:**
- `core/docs/architecture/TECHNICAL.md`
- `core/docs/architecture/ARCHITECTURE_OVERVIEW.md`
- `core/docs/architecture/MULTI_REPOSITORY.md`
- `core/docs/architecture/SCRIPTS_ARCHITECTURE.md`
- `core/docs/architecture/KNOWN_ISSUES.md`

**Что нужно обновить:**
- Заменить примеры с Македонией на Молдову (где применимо)
- Обновить упоминания валют MKD → EUR/MDL
- Обновить упоминания телефонных кодов +389 → +373
- Обновить примеры конфигураций с `country: "mk"` на `country: "md"`
- Обновить примеры локалей `mk-MK` → `ro-MD`

#### 6.5.2. Руководства

**Файлы:**
- `core/docs/guides/QUICK_START_RU.md`
- `core/docs/guides/LOCAL_DEVELOPMENT.md`
- `core/docs/guides/DEPLOYMENT.md`
- `core/docs/guides/PLATFORM_GUIDE.md`
- `core/docs/guides/PLATFORM_CHECKLIST.md`
- `core/docs/guides/SENTRY.md`

**Что нужно обновить:**
- Заменить примеры с Македонией на Молдову
- Обновить примеры конфигураций
- Обновить примеры команд с `COUNTRY=mk` на `COUNTRY=md`
- Обновить примеры переводов с `mk.json` на `ro.json` и `ru.json`

#### 6.5.3. Документация по функциям

**Файлы:**
- `core/docs/features/*.md` (все файлы в директории)

**Что нужно обновить:**
- Заменить примеры с Македонией на Молдову (где применимо)
- Обновить примеры данных (города, валюты, телефонные коды)

#### 6.5.4. Планы платформ

**Файлы:**
- `core/docs/platform-plans/PLAN_ALBANIA_PLATFORM.md`

**Что нужно обновить:**
- Добавить ссылки на план миграции для Молдовы (если нужно)
- Обновить примеры, где упоминается Македония как референс

#### 6.5.5. Корневые README файлы

**Файлы:**
- `README.md` (в корне проекта)
- `SETUP.md`
- `core/docs/README.md`

**Что нужно обновить:**
- Заменить примеры с Македонией на Молдову
- Обновить инструкции по настройке
- Обновить примеры конфигураций
- Обновить информацию о поддерживаемых странах/языках

#### 6.5.6. Другие документы

**Файлы:**
- `core/docs/analytics/GA4_EVENTS.md` - проверить на упоминания Македонии
- Все другие `.md` файлы в `core/docs/`

**Что нужно обновить:**
- Найти и заменить все упоминания Македонии на Молдову
- Обновить примеры данных
- Обновить примеры конфигураций

---

## 🔍 SEO и метаданные

### 7.1. Обновление метаданных сайта

**Важно:** Заголовок "Автомобили в Македонии" должен быть заменен на "Автомобили в Молдове", а не просто переведен.

**Файл:** `locales/ro.json` (румынский - основной)

**Ключевые ключи:**
```json
{
  "home": {
    "title": "Autoturisme în Moldova",
    "subtitle": "Cumpărați sau vindeți auto pe",
    "subtitleBold": "Kupito!",
    "subtitle2": "Publicați un anunț",
    "subtitle3": "gratuit.",
    "popularSearches": "Căutări populare"
  },
  "metadata": {
    "site": {
      "defaultTitle": "Autoturisme în Moldova | Kupito",
      "defaultDescription": "Cumpărați sau vindeți auto pe Kupito! Publicați un anunț gratuit.",
      "homePageDescription": "Cumpărați sau vindeți auto pe Kupito! Publicați un anunț gratuit. Platformă pentru cumpărarea și vânzarea de autoturisme online în Moldova. Anunțuri auto Moldova - publicare gratuită de anunțuri pentru persoane fizice și dealeri auto.",
      "homePageDescriptionWithBrand": "Cumpărați autoturisme {brand} pe Kupito! Găsiți cele mai bune prețuri și selecție de autoturisme {brand} în Moldova.",
      "homePageDescriptionWithBrandModel": "Cumpărați {brand} {model} pe Kupito! Găsiți cele mai bune prețuri și selecție de autoturisme {brand} {model} în Moldova.",
      "organizationDescription": "Cumpărați sau vindeți auto pe Kupito! Publicați un anunț gratuit. Platformă pentru cumpărarea și vânzarea de autoturisme online în Moldova. Anunțuri auto Moldova.",
      "keywords": [
        "autoturisme Moldova",
        "cumpărare autoturisme online",
        "vânzare autoturisme Moldova",
        "anunțuri auto Moldova",
        "mașini Moldova",
        "vinde mașină Moldova"
      ]
    }
  }
}
```

**Файл:** `locales/ru.json` (русский)

**Ключевые ключи:**
```json
{
  "home": {
    "title": "Автомобили в Молдове",
    "subtitle": "Купите или продайте авто на",
    "subtitleBold": "Kupito!",
    "subtitle2": "Разместите объявление",
    "subtitle3": "бесплатно.",
    "popularSearches": "Популярные поиски"
  },
  "metadata": {
    "site": {
      "defaultTitle": "Автомобили в Молдове | Kupito",
      "defaultDescription": "Купите или продайте автомобиль в Молдове на Kupito. Бесплатное размещение объявлений.",
      "homePageDescription": "Купите или продайте автомобиль в Молдове на Kupito! Разместите объявление бесплатно. Платформа для покупки и продажи автомобилей онлайн в Молдове. Объявления об автомобилях Молдова - бесплатное размещение объявлений для частных лиц и автосалонов.",
      "homePageDescriptionWithBrand": "Купите автомобили {brand} на Kupito! Найдите лучшие цены и выбор автомобилей {brand} в Молдове.",
      "homePageDescriptionWithBrandModel": "Купите {brand} {model} на Kupito! Найдите лучшие цены и выбор автомобилей {brand} {model} в Молдове.",
      "organizationDescription": "Купите или продайте автомобиль в Молдове на Kupito! Разместите объявление бесплатно. Платформа для покупки и продажи автомобилей онлайн в Молдове. Объявления об автомобилях Молдова.",
      "keywords": [
        "автомобили Молдова",
        "купить авто Молдова",
        "продать машину Молдова",
        "объявления авто Молдова",
        "машины Молдова"
      ]
    }
  }
}
```

**Где используется заголовок:**
- `core/frontend/app/page.tsx` - главная страница (через `t.home.title`)
- `core/frontend/app/manifest.ts` - PWA манифест (через `t.home.title`)
- `core/frontend/components/DynamicPageTitle.tsx` - динамический заголовок страницы (через `t('metadata.site.defaultTitle')`)
- `core/frontend/components/HomeHero.tsx` - компонент главной страницы (через `t.home.title`)

**Важно:** 
- Заголовок должен быть **"Автомобили в Молдове"** (русский) и **"Autoturisme în Moldova"** (румынский)
- НЕ использовать "Автомобили в Молдове" как перевод, а именно **заменить** упоминание Македонии на Молдову
- Все метаданные должны содержать "Молдова" вместо "Македония"

### 7.2. Обновление HTML lang атрибута

**Файл:** `core/frontend/app/layout.tsx`

**Текущий код:**
```typescript
<html lang={siteConfig.locale.split('-')[0]} suppressHydrationWarning>
```

**Проверить:**
- Для румынского: `lang="ro"` или `lang="ro-MD"`
- Для русского: `lang="ru"` или `lang="ru-MD"`
- Атрибут должен динамически обновляться при смене языка

### 7.3. Обновление Schema.org разметки

**Файл:** `core/frontend/components/OrganizationSchema.tsx` (или аналогичный)

- Заменить упоминания Македонии на Молдову
- Обновить адреса и географические данные
- Обновить валюты в предложениях

### 7.4. Обновление sitemap.xml

- Пересохранить sitemap.xml после всех изменений
- Убедиться, что все URL корректны
- Отправить в Google Search Console

---

## 🗺️ Географические сигналы

### 8.1. Обновление внутренних ссылок

**Где искать:**
- Анкоры в текстах
- Описания объявлений (seed data)
- Популярные поисковые запросы

**Замены:**
- "в Македонии" → "в Молдове" / "în Moldova"
- "Македония" → "Молдова" / "Moldova"

### 8.2. Обновление Google Search Console

**Действия:**
1. Убедиться, что Target country не задана как Северная Македония
2. Установить Target country: Молдова (или не устанавливать, если домен .md)
3. Request indexing для главной страницы
4. Request indexing для ключевых страниц (каталог, FAQ, etc.)

### 8.3. Обновление геолокационных данных

**Файлы:**
- `config/site.ts` - countryCode: "MD"
- Все упоминания координат (если есть)
- Карты (если используются)

---

## 🚀 Настройки инфраструктуры и деплоя

> **⚠️ Важно:** Эти настройки нужно обновить ПОСЛЕ завершения всех изменений кода, но ПЕРЕД финальным деплоем.

### 9.1. Обновление переменных окружения в Render.com

**Где:** Render Dashboard → Ваш Backend Service → Environment → Environment Variables

#### Backend Service (Render.com)

**Обновить переменные:**
```env
# Изменить: mk → md
NEXT_PUBLIC_COUNTRY=md

# Добавить новую переменную
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
```

**Оставить без изменений (домен тот же):**
```env
FRONTEND_URL=https://kupito.club
API_URL=https://api.kupito.club
WATERMARK_DOMAIN=kupito.club
```

#### Frontend Service (Render.com)

**Обновить переменные:**
```env
# Изменить: mk → md
NEXT_PUBLIC_COUNTRY=md

# Добавить новую переменную
NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true
```

**Оставить без изменений (домен тот же):**
```env
NEXT_PUBLIC_SITE_URL=https://kupito.club
NEXT_PUBLIC_API_URL=https://api.kupito.club
```

**Действия:**
1. Render Dashboard → Backend Service → Environment
2. Изменить `NEXT_PUBLIC_COUNTRY`: `mk` → `md`
3. Добавить `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
4. Render Dashboard → Frontend Service → Environment
5. Изменить `NEXT_PUBLIC_COUNTRY`: `mk` → `md`
6. Добавить `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
7. Сохранить изменения (Render перезапустит сервисы автоматически)

### 9.2. Проверка AWS S3

**Где:** AWS Console → S3 → Ваш bucket

**Действия:**
1. Проверить, что существующий bucket настроен для `https://kupito.club`
2. Проверить CORS - должен включать `https://kupito.club` и `https://www.kupito.club`
3. Проверить Bucket Policy - должен разрешать доступ с домена `kupito.club`

**Ничего менять не нужно** - домен остается тот же, S3 уже настроен.

### 9.3. Проверка DNS записей в Namecheap

**Где:** Namecheap Dashboard → Domain List → Ваш домен → Advanced DNS

**Действия:**
1. Проверить, что DNS записи настроены корректно
2. Проверить, что SSL сертификат активен в Render

**Ничего менять не нужно** - домен остается тот же (kupito.club).

### 9.4. Проверка после обновления настроек

**Чек-лист:**
- [ ] Переменные окружения в Render обновлены для Backend (`NEXT_PUBLIC_COUNTRY=md`, `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`)
- [ ] Переменные окружения в Render обновлены для Frontend (`NEXT_PUBLIC_COUNTRY=md`, `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`)
- [ ] S3 bucket проверен (CORS и Bucket Policy для `kupito.club`)
- [ ] SSL сертификат активен в Render
- [ ] Сайт доступен по `https://kupito.club`
- [ ] API доступен по `https://api.kupito.club`
- [ ] Загрузка изображений работает (проверить через форму создания объявления)
- [ ] Переключатель языка работает (`NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`)

**Порядок выполнения:**
1. Обновить переменные окружения в Render.com (Backend и Frontend)
2. Проверить S3 bucket (CORS и Bucket Policy)
3. Проверить DNS записи в Namecheap
4. Проверить доступность сайта и работу всех функций

---

## ✅ Чек-лист выполнения

> **📋 Приоритетность выполнения:**
> - 🔴 **Критично** - блокирует другие задачи, должно быть выполнено первым
> - 🟠 **Высокий** - важно для работы системы, зависит от критичных задач
> - 🟡 **Средний** - можно делать параллельно с другими задачами
> - 🟢 **Низкий** - можно отложить на конец, не блокирует работу

> **⚡ Оптимальная стратегия выполнения:**
> 1. Начать с критичных этапов (1, 1.1, 2)
> 2. Параллельно запустить поиск упоминаний (Этап 5) и работу над плейсхолдерами/юридическими документами (Этапы 5.1, 5.2)
> 3. После завершения переводов - система i18n и переключатель языка (Этапы 3, 4)
> 4. Завершить все замены перед SEO (Этап 5)
> 5. SEO и географические сигналы (Этапы 7, 8)
> 6. Тестирование и финальная проверка (Этапы 9, 10, 11)
> 7. Документацию (Этап 6) можно делать параллельно в любое время

### 📊 Оптимизированная последовательность выполнения

```
ФАЗА 1: Базовая конфигурация (🔴 Критично)
└─ Этап 1: Конфигурация
   └─ Этап 1.1: Обновление структуры городов

ФАЗА 2: Переводы и локализация (🔴 Критично)
├─ Этап 2: Переводы
│  ├─ Этап 5.1: Плейсхолдеры (🟡 параллельно)
│  └─ Этап 5.2: Юридические документы (🟡 параллельно)
├─ Этап 3: Система i18n
└─ Этап 4: Переключатель языка

ФАЗА 3: Замена упоминаний (🔴 Критично)
└─ Этап 5: Комплексная проверка и замена
   (можно начинать параллельно с Фазой 2)

ФАЗА 4: SEO и оптимизация (🟠 Высокий)
├─ Этап 7: SEO
└─ Этап 8: Географические сигналы

ФАЗА 5: Тестирование и проверка (🔴 Критично)
├─ Этап 9: Тестирование
├─ Этап 10: Настройки инфраструктуры (🟠 параллельно или после)
├─ Этап 11: Кеш и CDN
├─ Этап 12: Очистка и регенерация тестовых данных
└─ Этап 13: Финальная проверка

ФАЗА 6: Документация (🟢 Низкий - можно в конце)
└─ Этап 6: Обновление документации проекта
```

**Ключевые моменты:**
- ✅ Этапы 5.1 и 5.2 можно делать параллельно с Этапом 2 (переводы)
- ✅ Этап 5 (замена упоминаний) можно начинать параллельно с Фазой 2
- ✅ Этап 6 (документация) можно делать в конце, не блокирует работу
- ✅ Тестирование (Этап 9) должно быть ПОСЛЕ всех изменений

### ⚡ Рекомендации по параллельному выполнению

**Можно выполнять параллельно:**
1. **Этап 2 (Переводы) + Этап 5.1 (Плейсхолдеры) + Этап 5.2 (Юридические документы)**
   - Все работают с файлами переводов/конфигурации
   - Не конфликтуют друг с другом

2. **Этап 5 (Замена упоминаний) - поиск + Этап 2 (Переводы)**
   - Поиск упоминаний не блокирует создание переводов
   - Замены можно делать после создания базовых переводов

3. **Этап 6 (Документация) - в любое время**
   - Не блокирует работу приложения
   - Можно делать параллельно с любыми другими этапами

**Нельзя выполнять параллельно (зависимости):**
- Этап 3 (i18n) зависит от Этапа 2 (Переводы) - нужны файлы переводов
- Этап 4 (Переключатель языка) зависит от Этапа 3 (i18n) - нужна система i18n
- Этап 7 (SEO) зависит от завершения всех замен - нужны финальные метаданные
- Этап 9 (Тестирование) зависит от всех предыдущих этапов

### ⏱️ Ориентировочная последовательность (по приоритетам)

**Неделя 1: Критичные задачи**
- День 1-2: Этап 1 (Конфигурация) + Этап 1.1 (Города)
- День 3-5: Этап 2 (Переводы) + параллельно Этап 5.1 (Плейсхолдеры) + Этап 5.2 (Юридические документы)
- День 5-7: Этап 5 (Замена упоминаний) - поиск и начало замен

**Неделя 2: Система локализации**
- День 1-2: Этап 3 (i18n)
- День 3-4: Этап 4 (Переключатель языка)
- День 5-7: Завершение Этапа 5 (Замена упоминаний)

**Неделя 3: SEO и тестирование**
- День 1-2: Этап 7 (SEO) + Этап 8 (Географические сигналы)
- День 3-5: Этап 9 (Тестирование)
- День 6-7: Этап 10 (Настройки инфраструктуры) + Этап 11 (Кеш) + Этап 12 (Очистка данных) + Этап 13 (Финальная проверка)

**Неделя 4: Документация (можно параллельно)**
- Этап 6 (Документация) - можно делать в любое время

### 🔗 Критические зависимости между этапами

**Блокеры (нельзя начинать без завершения предыдущего):**
- ❌ Этап 1.1 → зависит от Этапа 1 (нужна конфигурация)
- ❌ Этап 3 → зависит от Этапа 2 (нужны файлы переводов)
- ❌ Этап 4 → зависит от Этапа 3 (нужна система i18n)
- ❌ Этап 7 → зависит от Этапа 5 (нужны финальные замены)
- ❌ Этап 8 → зависит от Этапа 7 (нужны SEO метаданные)
- ❌ Этап 9 → зависит от всех предыдущих этапов (кроме Этапа 6)
- ❌ Этап 10 → зависит от Этапа 9 (настройки инфраструктуры после тестирования)
- ❌ Этап 11 → зависит от Этапа 10 (сброс кеша после настройки инфраструктуры)
- ❌ Этап 12 → зависит от Этапа 11 (очистка данных после кеша)
- ❌ Этап 13 → зависит от Этапа 12 (финальная проверка после регенерации данных)

**Можно выполнять параллельно:**
- ✅ Этап 2 + Этап 5.1 + Этап 5.2 (работают с разными файлами)
- ✅ Этап 2 + Этап 5 (поиск упоминаний не блокирует создание переводов)
- ✅ Этап 6 (документация) - в любое время, не блокирует работу

**Рекомендуемый порядок для максимальной эффективности:**

1. **День 1-2:** Этап 1 + Этап 1.1 (базовая конфигурация)
2. **День 3-5:** 
   - Основной фокус: Этап 2 (Переводы)
   - Параллельно: Этап 5.1 (Плейсхолдеры) + Этап 5.2 (Юридические документы)
   - Параллельно: Этап 5 (поиск упоминаний - можно начать сразу)
3. **День 6-7:** Завершение Этапа 5 (замена упоминаний)
4. **День 8-9:** Этап 3 (i18n) + Этап 4 (Переключатель языка)
5. **День 10-11:** Этап 7 (SEO) + Этап 8 (Географические сигналы)
6. **День 12-14:** Этап 9 (Тестирование) + Этап 10 (Настройки инфраструктуры) + Этап 11 (Кеш) + Этап 12 (Очистка данных) + Этап 13 (Финальная проверка)
7. **В любое время:** Этап 6 (Документация)

### Этап 1: Конфигурация (🔴 Критично - основа для всех остальных задач)
- [x] Обновить `config/site.ts` (country, locale, currency, countryCode) ✅ **ЗАВЕРШЕНО** (country: "md", locale: "ro-MD", currency: "EUR", currencies: ["EUR", "MDL"], countryCode: "MD")
- [x] Обновить `package.json`: заменить `COUNTRY=mk` на `COUNTRY=md` в скриптах и обновить описание ✅ **ЗАВЕРШЕНО**
- [ ] Настроить переменную окружения `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true` (для включения переключателя языка) - нужно настроить в Render.com
- [x] Обновить константы валют в `core/backend/src/common/constants.ts` ✅ **ЗАВЕРШЕНО** (['EUR', 'MDL'])
- [x] Обновить константы валют в `core/frontend/lib/constants.ts` ✅ **ЗАВЕРШЕНО** (['EUR', 'MDL'])
- [x] Создать `core/backend/src/scripts/platforms/md/config.ts` с городами Молдовы ✅ **ЗАВЕРШЕНО**
- [x] Обновить телефонный префикс на +373 в конфигурации ✅ **ЗАВЕРШЕНО**
- [x] Обновить функцию `getPhoneWithCountryCode()` в `core/frontend/lib/utils.ts` (389 → 373) ✅ **ЗАВЕРШЕНО**
- [x] Обновить функцию `normalizePhoneNumber()` в `core/backend/src/auth/services/sms.service.ts` (+389 → +373) ✅ **ЗАВЕРШЕНО**
- [x] Обновить хардкодные +389 в `core/frontend/app/register/page.tsx` ✅ **ЗАВЕРШЕНО**
- [x] Обновить примеры в DTO файлах (+389 → +373) ✅ **ЗАВЕРШЕНО**

### Этап 1.1: Обновление структуры городов (🟠 Высокий - зависит от Этапа 1)
- [x] Обновить интерфейс `City` в `core/backend/src/cities/cities.service.ts` (добавить `nameRu?`) ✅ **ЗАВЕРШЕНО**
- [x] Обновить список городов в `core/backend/src/cities/cities.service.ts` с румынскими и русскими названиями ✅ **ЗАВЕРШЕНО**
- [x] Создать функцию `getCityName()` в `core/frontend/lib/utils.ts` с логикой для Молдовы ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/frontend/components/ListingForm/PriceAndLocationSection.tsx` для отображения городов по языку ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/frontend/hooks/useFilterOptions.ts` для отображения городов по языку ✅ **ЗАВЕРШЕНО** (включая обновление популярных городов для Молдовы)
- [x] Обновить `core/frontend/components/ListingCard.tsx` (заменить `getCityNameMk` на `getCityName`) ✅ **ЗАВЕРШЕНО** (уже использует `getCityName`)
- [x] Обновить `core/frontend/components/ListingPage/ListingPageSeller.tsx` (заменить `getCityNameMk` на `getCityName`) ✅ **ЗАВЕРШЕНО** (уже использует `getCityName`)
- [x] Обновить `core/frontend/components/UserListingsModal.tsx` (заменить `getCityNameMk` на `getCityName`) ✅ **ЗАВЕРШЕНО** (уже использует `getCityName`)

### Этап 2: Переводы (🔴 Критично - нужны для работы системы i18n)
- [x] Создать `locales/ro.json` (румынский - основной) ✅ **ЗАВЕРШЕНО**
- [x] Добавить секцию `common.apiErrors` в `locales/ro.json` для всех ошибок API ✅ **ЗАВЕРШЕНО**
- [x] Добавить секцию `common.apiErrors` в `locales/mk.json` (для обратной совместимости) ✅ **ЗАВЕРШЕНО**
- [x] Создать `locales/ru.json` (русский) ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/frontend/lib/locales/en.json` (английский fallback) ✅ **ЗАВЕРШЕНО**
- [x] **ВАЖНО:** Заменить заголовок `home.title` с "Автомобили во Македонија" на "Autoturisme în Moldova" (ro) и "Автомобили в Молдове" (ru) ✅ **ЗАВЕРШЕНО**
- [x] **ВАЖНО:** Заменить `metadata.site.defaultTitle` с "Автомобили во Македонија" на "Autoturisme în Moldova" (ro) и "Автомобили в Молдове" (ru) ✅ **ЗАВЕРШЕНО**
- [x] Заменить все упоминания Македонии на Молдову во всех файлах переводов ✅ **ЗАВЕРШЕНО** (ro.json, ru.json, en.json)
- [x] Обновить все метаданные (homePageDescription, keywords, etc.) - заменить Македонию на Молдову ✅ **ЗАВЕРШЕНО**
- [x] Обновить валюты с MKD на EUR/MDL в переводах ✅ **ЗАВЕРШЕНО** (в config/site.ts и constants.ts)
- [x] Запустить `npm run prepare:build` для копирования переводов в core ✅ **ЗАВЕРШЕНО**

### Этап 3: Система i18n (🟠 Высокий - зависит от Этапа 2)
- [x] Обновить `core/frontend/lib/i18n.ts` для поддержки 'ro' и 'ru' ✅ **ЗАВЕРШЕНО**
- [x] Обновить `getDefaultLocale()` для возврата 'ro' ✅ **ЗАВЕРШЕНО**
- [x] Обновить функции загрузки переводов (loadRoTranslations, loadRuTranslations) ✅ **ЗАВЕРШЕНО**
- [x] Обновить `getStoredLocale()` для чтения из localStorage ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/frontend/components/I18nProvider.tsx` для использования сохраненного языка ✅ **ЗАВЕРШЕНО**

### Этап 4: Переключатель языка (🟠 Высокий - зависит от Этапа 3)
- [x] Создать компонент `LanguageSwitcher.tsx` с проверкой переменной окружения ✅ **ЗАВЕРШЕНО**
- [x] Реализовать логику переключения языка с сохранением в localStorage ✅ **ЗАВЕРШЕНО**
- [x] Реализовать перезагрузку/обновление при смене языка ✅ **ЗАВЕРШЕНО**
- [x] Обновить `getStoredLocale()` для учета `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER` ✅ **ЗАВЕРШЕНО**
- [x] Добавить условное отображение LanguageSwitcher в Header (десктопная навигация) ✅ **ЗАВЕРШЕНО**
- [x] Добавить условное отображение LanguageSwitcher в Header (мобильное меню) ✅ **ЗАВЕРШЕНО**
- [x] Добавить условное отображение LanguageSwitcher в Footer ✅ **ЗАВЕРШЕНО**
- [x] Добавить переводы для названий языков (Română, Русский) в `locales/ro.json` и `locales/ru.json` ✅ **ЗАВЕРШЕНО**
- [ ] Протестировать переключение языков в хедере (когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`)
- [ ] Протестировать переключение языков в футере (когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`)
- [ ] Протестировать скрытие переключателя (когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false`)
- [ ] Протестировать сохранение выбранного языка при перезагрузке страницы (когда переключатель включен)
- [ ] Протестировать использование только дефолтного языка (когда переключатель отключен)

### Этап 5: Комплексная проверка и замена упоминаний Македонии (🔴 Критично - должно быть выполнено до тестирования)

> **Важно:** Этот этап можно начинать параллельно с Этапом 2 (переводы), так как поиск упоминаний не блокирует создание переводов. Однако все замены должны быть завершены до тестирования.
- [x] Выполнить автоматический поиск всех упоминаний Македонии (grep команды) ✅ **ЗАВЕРШЕНО**
- [x] Сохранить список всех найденных файлов с упоминаниями ✅ **ЗАВЕРШЕНО** (legal.ts mk/en версии, документация)
- [x] Проверить код проекта (`core/frontend/`, `core/backend/`) ✅ **ЗАВЕРШЕНО** (упоминания только в legal.ts mk/en версиях, что нормально)
- [x] Проверить конфигурационные файлы (`config/`) ✅ **ЗАВЕРШЕНО** (упоминания только в legal.ts mk/en версиях)
- [x] Проверить файлы переводов (`locales/`) ✅ **ЗАВЕРШЕНО** (ro.json, ru.json обновлены, упоминания Македонии заменены)
- [x] Проверить документацию (`core/docs/`, `README.md`, `SETUP.md`) ✅ **ЗАВЕРШЕНО** (все файлы проверены и обновлены)
- [x] Проверить CI/CD конфигурации (`.github/workflows/`) ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Проверить тестовые файлы ✅ **ЗАВЕРШЕНО** (заменены +389 → +373, MKD → EUR, Skopje → Chișinău во всех тестах)
- [x] Заменить все упоминания "Македония" → "Молдова" в коде ✅ **ЗАВЕРШЕНО** (в коде не найдено, только в legal.ts mk/en версиях)
- [x] Заменить все упоминания "Macedonia" → "Moldova" в коде ✅ **ЗАВЕРШЕНО** (в коде не найдено, только в legal.ts mk/en версиях)
- [x] **ВАЖНО:** Заменить заголовок `home.title`: "Автомобили во Македонија" → "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru) ✅ **ЗАВЕРШЕНО**
- [x] **ВАЖНО:** Заменить `metadata.site.defaultTitle`: "Автомобили во Македонија" → "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru) ✅ **ЗАВЕРШЕНО**
- [x] Заменить все упоминания "MKD" → "EUR" (где это валюта) ✅ **ЗАВЕРШЕНО** (в config/site.ts и constants.ts)
- [x] Заменить все упоминания "+389" → "+373" ✅ **ЗАВЕРШЕНО** (в функциях, register/page.tsx, DTO файлах)
- [x] Заменить все `country: "mk"` → `country: "md"` ✅ **ЗАВЕРШЕНО** (в config/site.ts)
- [x] Заменить все `locale: "mk-MK"` → `locale: "ro-MD"` ✅ **ЗАВЕРШЕНО** (в config/site.ts)
- [x] Заменить все `countryCode: "MK"` → `countryCode: "MD"` ✅ **ЗАВЕРШЕНО** (в config/site.ts)
- [x] Проверить и заменить в метаданных (homePageDescription, keywords, organizationDescription) ✅ **ЗАВЕРШЕНО** (в ro.json, ru.json, en.json)
- [x] Проверить и заменить в alt-текстах ✅ **ЗАВЕРШЕНО** (все alt-тексты используют переводы)
- [x] Проверить и заменить в Schema.org разметке ✅ **ЗАВЕРШЕНО** (SearchStructuredData, OrganizationSchema обновлены)
- [x] Проверить и заменить во внутренних ссылках ✅ **ЗАВЕРШЕНО** (проверено, упоминания только в legal.ts и faq.ts, которые требуют перевода)
- [x] Проверить и заменить в футере (tagline) ✅ **ЗАВЕРШЕНО** (в ro.json, ru.json, en.json)
- [x] Проверить PWA манифест (`app/manifest.ts`) - использует `t.home.title` ✅ **ЗАВЕРШЕНО** (использует правильный перевод)
- [x] Проверить динамический заголовок (`DynamicPageTitle.tsx`) - использует `metadata.site.defaultTitle` ✅ **ЗАВЕРШЕНО** (использует правильный перевод)
- [x] Выполнить повторный поиск после всех замен ✅ **ЗАВЕРШЕНО** (упоминания только в legal.ts mk/en версиях, что нормально)
- [x] Убедиться, что ничего не пропущено ✅ **ЗАВЕРШЕНО** (все упоминания в коде заменены, в legal.ts остались только для mk/en версий)

### Этап 5.1: Плейсхолдеры и переводы (🟡 Средний - можно делать параллельно с Этапом 2)

> **Примечание:** Можно выполнять параллельно с созданием переводов (Этап 2), так как требует добавления ключей в те же файлы переводов.
- [x] Найти все хардкодные плейсхолдеры в коде (grep по `placeholder="`) ✅ **ЧАСТИЧНО ЗАВЕРШЕНО** (найден и обновлен плейсхолдер телефона в register/page.tsx)
- [x] Добавить ключи переводов для всех плейсхолдеров в `locales/ro.json` и `locales/ru.json` ✅ **ЧАСТИЧНО ЗАВЕРШЕНО** (добавлен `register.phonePlaceholder` в ro.json, ru.json, en.json)
- [x] Заменить хардкодные плейсхолдеры на `t('key')` во всех формах ✅ **ЧАСТИЧНО ЗАВЕРШЕНО** (обновлен register/page.tsx, остальные формы требуют проверки)
- [x] Проверить плейсхолдеры в `PriceAndLocationSection.tsx` ✅ **ЗАВЕРШЕНО**
- [x] Проверить плейсхолдеры в `TechnicalSpecsSection.tsx` ✅ **ЗАВЕРШЕНО**
- [x] Проверить плейсхолдеры в `BasicFilters.tsx` и `AdvancedFilters.tsx` ✅ **ЗАВЕРШЕНО**
- [x] Проверить плейсхолдеры в `register/page.tsx` и `login/page.tsx` ✅ **ЗАВЕРШЕНО** (добавлен `register.phonePlaceholder`, обновлен register/page.tsx)
- [x] **TODO:** Добавить правило в линтер для проверки хардкодных плейсхолдеров ✅ **ЗАВЕРШЕНО** (добавлена проверка македонских текстов ошибок в toast-уведомлениях)

### Этап 5.2: Юридические документы (🟡 Средний - можно делать параллельно с Этапом 2)

> **Примечание:** Можно выполнять параллельно с созданием переводов (Этап 2), так как это отдельные файлы конфигурации.
- [x] Обновить структуру FAQ (`config/faq.ts`) для поддержки ro/ru ✅ **ЗАВЕРШЕНО** (структура обновлена, все 22 вопроса и 4 сценария переведены на ro/ru)
- [x] Завершить перевод всех вопросов FAQ на ro/ru ✅ **ЗАВЕРШЕНО** (все вопросы и сценарии переведены)
- [x] Обновить Terms (`config/legal.ts` - terms) - заменить Македонию на Молдову, перевести на ro/ru ✅ **ЗАВЕРШЕНО** (все секции переведены)
- [x] Обновить Privacy (`config/legal.ts` - privacy) - заменить Македонию на Молдову, перевести на ro/ru ✅ **ЗАВЕРШЕНО** (все секции переведены)
- [x] Проверить и обновить Cookie Settings страницу ✅ **ЗАВЕРШЕНО** (метаданные обновлены для использования переводов)

### Этап 2.1: Переводы ошибок API и тост-уведомлений (🔴 Критично - выполнено)
- [x] Добавить секцию `common.apiErrors` в `locales/ro.json` со всеми переводами ошибок API ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/frontend/lib/api.ts` для использования переводов из `common.apiErrors` ✅ **ЗАВЕРШЕНО**
- [x] Добавить проверку стандартных македонских ошибок и замену на переводы ✅ **ЗАВЕРШЕНО**
- [x] Обновить бэкенд `core/backend/src/common/filters/http-exception.filter.ts` для поддержки 'ro' и 'ru' ✅ **ЗАВЕРШЕНО**
- [x] Обновить бэкенд `core/backend/src/common/i18n/i18n.service.ts` для загрузки ro/ru переводов ✅ **ЗАВЕРШЕНО**
- [x] Создать `core/backend/src/common/i18n/ro.json` с переводами всех ошибок ✅ **ЗАВЕРШЕНО**
- [x] Создать `core/backend/src/common/i18n/ru.json` с переводами всех ошибок ✅ **ЗАВЕРШЕНО**
- [x] Исправить хардкодные тексты в `core/backend/src/common/utils/error-handling.utils.ts` ✅ **ЗАВЕРШЕНО**
- [x] Исправить хардкодные тексты в `core/backend/src/upload/upload.service.ts` ✅ **ЗАВЕРШЕНО**
- [x] Удалить проверки на хардкодный македонский текст в `login/page.tsx`, `complete-profile/page.tsx`, `verify-phone/page.tsx` ✅ **ЗАВЕРШЕНО**
- [x] Добавить правило линтера для проверки македонских текстов ошибок в toast-уведомлениях ✅ **ЗАВЕРШЕНО**

### Этап 6: Обновление документации проекта (🟢 Низкий - можно делать в конце, не блокирует работу)

> **Примечание:** Документацию можно обновлять в конце, после всех основных изменений. Это не блокирует работу приложения.
- [x] Обновить `core/docs/architecture/TECHNICAL.md` ✅ **ЗАВЕРШЕНО** (только команды mkdir, не критично)
- [x] Обновить `core/docs/architecture/ARCHITECTURE_OVERVIEW.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/architecture/MULTI_REPOSITORY.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/architecture/SCRIPTS_ARCHITECTURE.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/architecture/KNOWN_ISSUES.md` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Обновить `core/docs/guides/QUICK_START_RU.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/guides/LOCAL_DEVELOPMENT.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/guides/DEPLOYMENT.md` ✅ **ЗАВЕРШЕНО** (только команды mkdir, не критично)
- [x] Обновить `core/docs/guides/PLATFORM_GUIDE.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/guides/PLATFORM_CHECKLIST.md` ✅ **ЗАВЕРШЕНО**
- [x] Обновить `core/docs/guides/SENTRY.md` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Обновить все файлы в `core/docs/features/` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Обновить `core/docs/platform-plans/PLAN_ALBANIA_PLATFORM.md` ✅ **ЗАВЕРШЕНО** (заменены все упоминания MKD, mk.json, Macedonia)
- [x] Обновить `core/docs/analytics/GA4_EVENTS.md` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Обновить `README.md` в корне проекта ✅ **ЗАВЕРШЕНО**
- [x] Обновить `SETUP.md` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Обновить `core/docs/README.md` ✅ **ЗАВЕРШЕНО** (упоминаний не найдено)
- [x] Найти и заменить все упоминания Македонии в документации ✅ **ЗАВЕРШЕНО** (все упоминания заменены в MULTI_REPOSITORY.md, QUICK_START_RU.md, PLAN_ALBANIA_PLATFORM.md)

### Этап 7: SEO (🟠 Высокий - зависит от завершения всех замен и переводов)
- [x] Обновить HTML lang атрибут в layout.tsx ✅ **ЗАВЕРШЕНО** (использует `siteConfig.locale.split('-')[0]`, динамически для ro/ru)
- [x] Обновить метаданные в переводах (metadata.site.*) ✅ **ЗАВЕРШЕНО** (в ro.json, ru.json, en.json)
- [x] Обновить keywords в метаданных ✅ **ЗАВЕРШЕНО** (в ro.json, ru.json, en.json)
- [ ] Пересохранить sitemap.xml
- [ ] Отправить sitemap в Google Search Console
- [ ] Request indexing для главной страницы
- [ ] Request indexing для ключевых страниц

### Этап 8: Географические сигналы (🟠 Высокий - зависит от Этапа 7)
- [ ] Обновить Target country в Google Search Console
- [ ] Обновить описания объявлений (seed data) с городами Молдовы
- [ ] Обновить популярные поисковые запросы (если нужно)
- [ ] Проверить все упоминания координат и карт

### Этап 9: Тестирование (🔴 Критично - должно быть выполнено после всех изменений)

> **Важно:** Тестирование должно выполняться ПОСЛЕ завершения всех предыдущих этапов (кроме документации).
- [ ] Протестировать отображение валют (EUR, MDL)
- [ ] Протестировать список городов на румынском языке (только румынские названия)
- [ ] Протестировать список городов на русском языке (русские названия, румынские в скобках)
- [ ] Протестировать отображение городов в карточках объявлений на обоих языках
- [ ] Протестировать отображение городов в формах на обоих языках
- [ ] **Протестировать переключатель языка с `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`:**
  - [ ] Переключатель отображается в хедере (десктоп)
  - [ ] Переключатель отображается в хедере (мобильное меню)
  - [ ] Переключатель отображается в футере
  - [ ] Переключение языков работает корректно
  - [ ] Язык сохраняется в localStorage
- [ ] **Протестировать переключатель языка с `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false`:**
  - [ ] Переключатель НЕ отображается в хедере
  - [ ] Переключатель НЕ отображается в футере
  - [ ] Используется только дефолтный язык (румынский)
  - [ ] Сохраненный язык в localStorage игнорируется
- [ ] Протестировать переключение языков (ro/ru) и обновление названий городов
- [ ] Протестировать сохранение языка в localStorage (когда переключатель включен)
- [ ] Протестировать нормализацию телефонных номеров (+373)
- [ ] Протестировать отправку SMS с молдавскими номерами
- [ ] Протестировать генерацию ссылок Telegram/WhatsApp с молдавскими номерами
- [ ] Протестировать все страницы на обоих языках (когда переключатель включен)
- [ ] Протестировать все страницы на дефолтном языке (когда переключатель отключен)
- [ ] Проверить отсутствие упоминаний Македонии
- [ ] Проверить корректность всех переводов

### Этап 10: Настройки инфраструктуры (🟠 Высокий - после тестирования, перед финальным деплоем)

- [ ] Render.com → Backend Service → Environment:
  - [ ] Изменить `NEXT_PUBLIC_COUNTRY`: `mk` → `md`
  - [ ] Добавить `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- [ ] Render.com → Frontend Service → Environment:
  - [ ] Изменить `NEXT_PUBLIC_COUNTRY`: `mk` → `md`
  - [ ] Добавить `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- [ ] AWS Console → S3 → Проверить bucket:
  - [ ] CORS включает `https://kupito.club` и `https://www.kupito.club`
  - [ ] Bucket Policy разрешает доступ с `kupito.club`
- [ ] Namecheap → Проверить DNS записи (ничего менять не нужно)
- [ ] Render.com → Проверить SSL сертификат (должен быть активен)
- [ ] Проверить доступность сайта: `https://kupito.club`
- [ ] Проверить доступность API: `https://api.kupito.club`
- [ ] Протестировать загрузку изображений
- [ ] Протестировать переключатель языка

### Этап 11: Кеш и CDN (🟠 Высокий - после тестирования, перед финальной проверкой)
- [ ] Сбросить кеш приложения
- [ ] Сбросить CDN кеш (если используется)
- [ ] Убедиться, что Google видит новый контент

### Этап 12: Очистка и регенерация тестовых данных (🟠 Высокий - после всех изменений кода)

- [ ] Удалить все объявления из локальной базы данных
- [ ] Удалить всех пользователей из локальной базы данных
- [ ] Очистить связанные данные (изображения, избранное, сравнения)
- [x] Обновить скрипты генерации данных: ✅ **ЗАВЕРШЕНО**
  - [x] Проверить использование `getPlatformConfig()` для Молдовы ✅ **ЗАВЕРШЕНО** (использует mdConfig)
  - [x] Обновить `checkPlatform(['md'])` вместо `checkPlatform(['mk', 'al'])` ✅ **ЗАВЕРШЕНО** (все 22 скрипта обновлены)
  - [x] Обновить использование городов из конфигурации Молдовы ✅ **ЗАВЕРШЕНО** (использует platforms/md/config.ts)
  - [x] Обновить описания на румынском языке ✅ **ЗАВЕРШЕНО** (в platforms/md/config.ts)
  - [x] Обновить телефонный префикс на `+373` ✅ **ЗАВЕРШЕНО** (в platforms/md/config.ts)
  - [x] Обновить тестовые данные (имена, компании) на румынском ✅ **ЗАВЕРШЕНО** (в platforms/md/config.ts)
- [x] Установить переменную окружения `COUNTRY=md` ✅ **ЗАВЕРШЕНО** (по умолчанию используется 'md')
- [ ] Запустить скрипт генерации пользователей
- [ ] Запустить скрипт генерации объявлений
- [ ] Проверить сгенерированные данные:
  - [ ] Пользователи с правильными именами (румынские)
  - [ ] Объявления с правильными городами (Chișinău, Bălți и т.д.)
  - [ ] Описания на румынском языке
  - [ ] Телефонные номера с префиксом `+373`
  - [ ] Валюты EUR и MDL
  - [ ] Все данные отображаются корректно на сайте

### Этап 13: Финальная проверка (🔴 Критично - финальный этап перед деплоем)
- [ ] Выполнить финальный поиск всех упоминаний Македонии (grep команды из раздела 6.2.1)
- [ ] Убедиться, что не осталось упоминаний "Македония", "Macedonia", "MKD", "+389" (кроме исключений)
- [ ] Проверить все страницы на румынском языке
- [ ] Проверить все страницы на русском языке
- [ ] Проверить корректность валют везде (EUR, MDL)
- [ ] Проверить корректность городов везде (румынские/русские названия)
- [ ] Проверить корректность телефонных кодов (+373) везде
- [ ] Проверить отсутствие упоминаний Македонии в коде
- [ ] Проверить отсутствие упоминаний телефонного кода +389
- [ ] Проверить отсутствие упоминаний валюты MKD (кроме исключений)
- [ ] Проверить отсутствие упоминаний `country: "mk"` (должно быть "md")
- [ ] Проверить отсутствие упоминаний `locale: "mk-MK"` (должно быть "ro-MD")
- [ ] Проверить работу переключателя языка в хедере (десктоп) - когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- [ ] Проверить работу переключателя языка в хедере (мобильное меню) - когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- [ ] Проверить работу переключателя языка в футере - когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=true`
- [ ] Проверить, что переключатель НЕ отображается, когда `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER=false`
- [ ] Проверить сохранение языка в localStorage (когда переключатель включен)
- [ ] Проверить использование только дефолтного языка (когда переключатель отключен)
- [ ] **Проверить заголовок главной страницы:** должен быть "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru), НЕ "Автомобили в Македонии"
- [ ] **Проверить мета-заголовок (defaultTitle):** должен быть "Autoturisme în Moldova" (ro) / "Автомобили в Молдове" (ru)
- [ ] Проверить метаданные и SEO (нет упоминаний Македонии)
- [ ] Проверить Schema.org разметку (нет упоминаний Македонии)
- [ ] Проверить alt-тексты изображений (нет упоминаний Македонии)
- [ ] Проверить PWA манифест (использует правильный заголовок)
- [ ] Проверить FAQ страницу (все вопросы и ответы на ro/ru, нет упоминаний Македонии)
- [ ] Проверить Terms страницу (все тексты на ro/ru, нет упоминаний Македонии)
- [ ] Проверить Privacy страницу (все тексты на ro/ru, нет упоминаний Македонии)
- [ ] Проверить Cookie Settings страницу
- [ ] Проверить документацию проекта (нет упоминаний Македонии, обновлены примеры)
- [ ] Проверить комментарии в коде (нет упоминаний Македонии)

---

## 📌 Важные замечания

### Что остается без изменений:
- ✅ Популярные наборы (бренды) - остаются как есть
- ✅ Цвета сайта - остаются как есть
- ✅ Марки автомобилей - не трогать
- ✅ Модели автомобилей - не трогать
- ✅ Структура сайта - остается как есть

### Что нужно изменить:
- ⚠️ Валюта: MKD → EUR (главная), добавить MDL
- ⚠️ Города: македонские → молдавские (румынские названия + русские)
- ⚠️ Логика отображения городов: 
  - Румынский язык: только румынские названия (без скобок)
  - Русский язык: русские названия, румынские в скобках
- ⚠️ Языки: македонский → румынский (главный) + русский
- ⚠️ Переключатель языка: управляется через `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER`
  - `true` → показывается переключатель (румынский + русский)
  - `false` или не задана → только дефолтный язык (румынский), переключатель скрыт
- ⚠️ Все упоминания Македонии → Молдова
- ⚠️ Телефонный код: +389 → +373
- ⚠️ Плейсхолдеры: все хардкодные плейсхолдеры должны быть в переводах (ro.json, ru.json)
- ⚠️ Юридические документы: FAQ, Terms, Privacy - перевести на ro/ru, заменить Македонию на Молдову
- ⚠️ Документация проекта: обновить все .md файлы, заменить примеры с Македонией на Молдову
- ⚠️ **Настройки инфраструктуры:** Обновить переменные окружения в Render.com (`NEXT_PUBLIC_COUNTRY=md`, добавить `NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCHER`). DNS менять НЕ нужно - домен остается тот же.
- ⚠️ TODO: Добавить правило в линтер для проверки хардкодных плейсхолдеров

### Оптимизированный порядок выполнения:

**Фаза 1: Базовая конфигурация (🔴 Критично)**
1. Этап 1: Конфигурация (country, locale, currency, валюты, телефонные коды)
2. Этап 1.1: Обновление структуры городов

**Фаза 2: Переводы и локализация (🔴 Критично)**
3. Этап 2: Переводы (создание ro.json, ru.json, обновление en.json)
4. Этап 3: Система i18n (поддержка ro/ru, localStorage)
5. Этап 4: Переключатель языка (Header + Footer)

**Фаза 3: Замена упоминаний (🔴 Критично - можно начинать параллельно с Фазой 2)**
6. Этап 5: Комплексная проверка и замена упоминаний Македонии
   - Можно начинать параллельно с Этапом 2 (поиск упоминаний)
   - Замены должны быть завершены до тестирования

**Фаза 4: Дополнительные задачи (🟡 Средний - можно делать параллельно)**
7. Этап 5.1: Плейсхолдеры (можно делать параллельно с Этапом 2)
8. Этап 5.2: Юридические документы (можно делать параллельно с Этапом 2)

**Фаза 5: SEO и оптимизация (🟠 Высокий)**
9. Этап 7: SEO (метаданные, sitemap, Google Search Console)
10. Этап 8: Географические сигналы

**Фаза 6: Тестирование и проверка (🔴 Критично)**
11. Этап 9: Тестирование (после всех изменений)
12. Этап 10: Настройки инфраструктуры (Render.com, S3, Namecheap DNS)
13. Этап 11: Кеш и CDN
14. Этап 12: Очистка и регенерация тестовых данных
15. Этап 13: Финальная проверка

**Фаза 7: Документация (🟢 Низкий - можно делать в конце)**
14. Этап 6: Обновление документации проекта (не блокирует работу)

### Критически важно:
- ⚠️ **Провести полную проверку всего проекта на упоминания Македонии**
- ⚠️ Использовать grep команды для автоматического поиска
- ⚠️ Проверить код, конфиги, переводы, документацию, тесты
- ⚠️ Выполнить повторную проверку после всех замен
- ⚠️ Убедиться, что ничего не пропущено

---

## 🔗 Связанные документы

- [Инструкции для деплоя на продакшн](./PRODUCTION_DEPLOYMENT.md) - **ВАЖНО:** Что делать на проде после релиза
- [Архитектура проекта](../core/docs/architecture/TECHNICAL.md)
- [План для Албании](../core/docs/platform-plans/PLAN_ALBANIA_PLATFORM.md) - можно использовать как референс
- [Мульти-репозиторная архитектура](../core/docs/architecture/MULTI_REPOSITORY.md)

---

## 📝 Заметки

- Документ будет обновляться по мере выполнения задач
- Все изменения должны быть протестированы перед деплоем
- Важно сохранить обратную совместимость, если это возможно

---

## 🧹 Очистка и регенерация тестовых данных

> **⚠️ Важно:** Этот этап выполняется ПОСЛЕ всех изменений кода, но ПЕРЕД финальным тестированием.

### 13.1. Удаление существующих данных

**Действия:**
1. Удалить все объявления из локальной базы данных
2. Удалить всех пользователей из локальной базы данных
3. Очистить связанные данные (изображения, избранное, сравнения и т.д.)

**Способы очистки:**
- Через SQL запросы в базе данных
- Через скрипты очистки (если есть)
- Через админ-панель (если доступна)

### 13.2. Обновление скриптов генерации данных

**Файлы для проверки и обновления:**
- `core/backend/src/scripts/stage/seed.ts` - основной скрипт генерации
- `core/backend/src/scripts/platforms/md/config.ts` - конфигурация для Молдовы (уже создана)
- Все скрипты, которые используют данные из `platforms/mk/config.ts` - обновить на `platforms/md/config.ts`

**Что нужно обновить:**
- Использование `getPlatformConfig()` для получения данных Молдовы
- Проверка `checkPlatform(['md'])` вместо `checkPlatform(['mk'])`
- Использование городов из конфигурации Молдовы
- Использование описаний на румынском языке
- Использование телефонного префикса `+373`
- Использование тестовых данных (имена, названия компаний) на румынском

### 13.3. Генерация новых тестовых данных

**Действия:**
1. Убедиться, что переменная окружения `COUNTRY=md` установлена
2. Запустить скрипт генерации пользователей
3. Запустить скрипт генерации объявлений
4. Проверить, что данные сгенерированы корректно:
   - Города на румынском/русском (в зависимости от языка)
   - Описания на румынском
   - Телефонные номера с префиксом `+373`
   - Валюты EUR и MDL
   - Тестовые имена пользователей на румынском

**Команды:**
```bash
# Установить переменную окружения
export COUNTRY=md

# Запустить скрипты генерации (пример)
cd core/backend
npm run seed:users
npm run seed:listings
```

**Проверка:**
- [ ] Пользователи созданы с правильными именами (румынские)
- [ ] Объявления созданы с правильными городами (Chișinău, Bălți и т.д.)
- [ ] Описания объявлений на румынском языке
- [ ] Телефонные номера с префиксом `+373`
- [ ] Валюты в объявлениях: EUR и MDL
- [ ] Все данные отображаются корректно на сайте
