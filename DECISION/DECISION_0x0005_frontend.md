
## Точка входа

```
index.html → main.jsx → App.jsx
```

### `App.jsx`
```javascript
<StoreProvider>           // MobX хранилища
  <LayersProvider>        // Платформа, язык, тема
    <PlatformRouter />    // Web или Telegram роутинг
  </LayersProvider>
</StoreProvider>
```

---

## Слои (Layers)

Контекстные провайдеры 

### Структура
```
LayersProvider
├── PlatformProvider   // Определение платформы
├── LanguageProvider   // Переводы (ru, en, fr)
└── ThemeProvider      // Темы (light, dark, darling)
```

### **PlatformProvider** (`layers/platform/`)

**Определение платформы:**
```javascript
// Проверяет:
1. window.Telegram?.WebApp?.initData
2. URL параметры (tgWebApp)
3. User Agent (telegram)
4. По умолчанию: 'web'
```

```javascript
{
  web: {
    layout: 'MainLayout',
    navigation: 'stack'
  },
  telegram: {
    layout: 'TelegramLayout',
    navigation: 'bottom-tabs',
    styles: { /* Telegram CSS переменные */ }
  }
}
```

**Хук:** `usePlatform()` → `{ platform, config, isTelegram, utils }`

### 2. **LanguageProvider** (`layers/language/`)

**Поддерживаемые языки:**
- `ru` - Русский (по умолчанию)
- `en` - English
- `fr` - Français

**Хук:** `useLanguage()` → `{ t, language, setLanguage, languages }`

**Использование:**
```javascript
const { t } = useLanguage();
<h1>{t('entries.form.title')}</h1>
```

### 3. **ThemeProvider** (`layers/theme/`)

**Темы:**
- `light` - Светлая (по умолчанию)
- `dark` - Тёмная
- `darling` - Красная

**Механизм:**
```javascript
// data-theme атрибут
document.documentElement.setAttribute('data-theme', 'dark');

// CSS автоматически применяет переменные из ok.css:
[data-theme="dark"] {
  --color-background: #111827;
  --color-text: #f9fafb;
}
```

**Хук:** `useTheme()` → `{ theme, themeData, setTheme, themes }`

---

## Хранилище (Store)

MobX для управления состоянием.

### Структура
```
RootStore
├── authStore           // Аутентификация
├── entriesStore        // Записи (создание, список)
├── bodyStatesStore     // Состояния тела (HP, Energy)
├── circumstancesStore  // Обстоятельства (погода, время)
├── skillsStore         // Навыки и прогресс
├── uiStore            // UI состояние (ошибки, загрузка)
└── urlSyncStore       // Синхронизация с URL (формы)
```

### Хуки
```javascript
useStores()            // Все сторы
useAuthStore()         // authStore
useEntriesStore()      // entriesStore
useBodyStatesStore()   // bodyStatesStore
useCircumstancesStore() // circumstancesStore
useSkillsStore()       // skillsStore
useUIStore()           // uiStore
useUrlSyncStore()      // urlSyncStore
```

### Пример использования
```javascript
const entriesStore = useEntriesStore();
const entries = entriesStore.entries; // MobX observable
await entriesStore.createEntry(data);
```

---

## Роутинг

### Web платформа (`platforms/web/router.jsx`)
**Библиотека:** React Router (BrowserRouter)

```
/login              → AuthPage
/ (MainLayout)
  ├── /             → TimelinePage (главная)
  ├── /entries/create → CreateEntryPage
  ├── /entries/:id  → EntryDetailPage
  ├── /analytics    → AnalyticsPage
  └── /settings     → SettingsPage
```

### Telegram платформа (`platforms/telegram/router.jsx`)
**Механизм:** Switch-case роутинг (без React Router)

```javascript
switch(currentRoute.screen) {
  case 'timeline':     return <TimelinePage />;
  case 'create-entry': return <CreateEntryPage />;
  case 'entry-detail': return <EntryDetailPage id={...} />;
  case 'analytics':    return <AnalyticsPage />;
  case 'settings':     return <SettingsPage />;
}
```

**Layout:** `TelegramLayout` (без Header, с Bottom Navigation)

---

## UI компоненты

### Layouts
```
MainLayout.jsx         // Header + Outlet + Navigation
├── Header.jsx        // Лого, поиск, переключатели темы/языка
└── Navigation.jsx    // Нижняя навигация (mobile)

TelegramLayout.jsx    // Только контент + Telegram Bottom Tabs
```

### Платформенные адаптеры (`ui/components/common/PlatformAdapter/`)
Универсальные компоненты для web и telegram:

```javascript
<PlatformButton variant="primary" haptic />
<PlatformInput type="text" />
<PlatformTextArea rows={4} />
<PlatformModal isOpen={true} size="lg" />
<PlatformPicker items={[]} />
```

**Особенности:**
- Автоматически адаптируются под платформу
- Поддержка Telegram haptic feedback
- Единый API для обеих платформ

### Пикеры
```
EmotionPicker          // Выбор эмоций с интенсивностью
CircumstancesPicker    // Погода, время суток, температура
BodyStatePicker        // HP, Energy, Location
SkillsPicker           // Навыки и уровни
RelationPicker         // Связи между записями
TagsPicker             // Хэштеги
EntryTypePicker        // Тип записи (note, memory, plan, goal)
```

### Формы
```
EntryForm              // Главная форма создания записи
├── Использует все пикеры
├── Модалки для каждого пикера
├── UrlStatusBar (превью выбранного)
└── Валидация перед отправкой
```

### Страницы
```
pages/
├── auth/
│   └── AuthPage           // Вход/регистрация
├── entries/
│   ├── CreateEntryPage    // Создание записи
│   └── detail/
│       └── EntryDetailPage // Просмотр записи
├── analytics/
│   ├── AnalyticsPage       // Графики и статистика
│   └── AnalyticsTimelinePage // Лента записей
└── settings/
    └── SettingsPage        // Настройки
```

---

## Core

### Entities (Доменные модели)
```
core/entities/
├── Entry.js           // Запись
├── Emotion.js         // Эмоция
├── BodyState.js       // Состояние тела
├── Circumstance.js    // Обстоятельство
├── Skill.js           // Навык
├── SkillProgress.js   // Прогресс навыка
├── Relation.js        // Связь
├── Tag.js            // Тег
├── Person.js         // Человек
└── User.js           // Пользователь
```

### Repositories (Работа с API)
```
core/repositories/
├── EntriesRepository.js       // CRUD для записей
├── BodyStatesRepository.js    // Состояния тела
├── CircumstancesRepository.js // Обстоятельства
├── SkillsRepository.js        // Навыки
├── EmotionsRepository.js      // Эмоции
├── PeopleRepository.js        // Люди
├── RelationsRepository.js     // Связи
├── TagsRepository.js          // Теги
├── AuthRepository.js          // Аутентификация
└── AnalyticsRepository.js     // Аналитика
```

### API Clients
```
core/adapters/api/clients/
├── EntriesAPIClient.js
├── BodyStatesAPIClient.js
├── CircumstancesAPIClient.js
├── SkillsAPIClient.js
└── AuthAPIClient.js
```

### Mappers (DTO ↔ Entity)
```
core/adapters/api/mappers/
├── EntryMapper.js
├── BodyStateMapper.js
├── CircumstanceMapper.js
├── SkillMapper.js
└── UserMapper.js
```

---

## Стилизация

### CSS (`ok.css`)

```css
:root {
  /* По умолчанию - светлая тема */
  --color-background: #ffffff;
  --color-text: #111827;
  /* ... */
}

[data-theme="dark"] {
  --color-background: #111827;
  --color-text: #f9fafb;
  /* ... */
}

[data-theme="darling"] {
  --color-background: #0a0a0a;
  --color-primary: #ff3366;
  /* ... */
}
```

---

```
src/
├── main.jsx                    # Точка входа
├── App.jsx                     # Корневой компонент
├── ok.css                      # Глобальные стили + темы
│
├── core/                       # Бизнес-логика
│   ├── entities/              # Модели данных
│   ├── repositories/          # Работа с данными
│   ├── adapters/              # API клиенты и мапперы
│   └── constants/             # Константы
│
├── layers/                     # Контекстные провайдеры
│   ├── platform/              # Определение платформы
│   ├── language/              # Переводы
│   └── theme/                 # Темы
│
├── store/                      # MobX хранилища
│   ├── RootStore.js
│   ├── StoreContext.jsx
│   └── stores/
│
├── ui/                         # UI компоненты
│   ├── components/
│   │   ├── common/            # Общие (Button, Modal, etc)
│   │   ├── layout/            # Header, Navigation
│   │   ├── entries/           # Связанные с записями
│   │   ├── emotions/          # Пикеры эмоций
│   │   └── ...
│   ├── layouts/               # MainLayout, TelegramLayout
│   ├── pages/                 # Страницы приложения
│   └── styles/
│
├── security/                   # Валидация и санитизация
│   ├── pipelines/
│   ├── sanitizers/
│   └── validators/
│
├── platforms/                  # Платформо-специфичные роутеры
│   ├── web/router.jsx
│   └── telegram/router.jsx
│
└── PlatformRouter.jsx         # Выбор роутера по платформе
```

**Версия:** 24.12.2025