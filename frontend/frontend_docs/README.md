# AIM Frontend — Карта Проекта

> Web UI для Life Graph — психологический профиль через графовый анализ снов, воспоминаний, мыслей, планов и действий.

## Быстрый Старт

```
Стек: React 18 + Vite + MobX + React Router + CSS Variables

Запуск:
  npm install
  npm run dev          # PORT=5173
  npm run build        # production build
  npm run test         # Jest
  npm run lint         # ESLint
  npm run storybook    # component stories

Переменные окружения:
  VITE_API_URL=http://localhost:3003/api/v1  — API endpoint (default)
```

```
UI: http://localhost:5173
API: http://localhost:3003/api/v1 (бэкенд)
Storybook: http://localhost:6006
```

---

## Архитектура (одной страницей)

```
React App (main.jsx)
    ↓
<App />
    ↓
<StoreProvider>  ← MobX RootStore singleton (11 sub-stores)
    ↓
<LayersProvider>  ← 4 nested context providers
    ↓
<PlatformProvider>  ← web / telegram detection
    ↓
<LanguageProvider>  ← i18n: ru, en, fr (t() function)
    ↓
<ThemeProvider>  ← 4 themes: light, dark, darling, neon
    ↓
<PlatformRouter />  ← routes based on detected platform
    ↓
┌──────────────────────────────────┐
│ Web: BrowserRouter + MainLayout  │  Telegram: nav stack + TelegramLayout
│   ├─ Header                      │   ├─ TG MainButton + BackButton
│   ├─ <Outlet /> (page component) │   ├─ hamburger menu
│   └─ Bottom Navigation           │   └─ bottom nav
└──────────────────────────────────┘
    ↓
Page → Store (@action) → API Client → Axios → Backend
      ← Observable state update ← React re-render
```

### Модульная структура

```
src/
├── main.jsx                    # Entry — renders <App />
├── App.jsx                     # Root component: Store > Layers > Router
├── PlatformRouter.jsx          # Platform-based router selection
├── ok.css                      # Global CSS — variables, 4 themes, neon animations (891 lines)
│
├── layers/                     # Cross-cutting concerns (React Context)
│   ├── platform/               # Platform detection: web / telegram
│   ├── language/               # i18n: ru, en, fr (~636 lines each)
│   ├── theme/                  # 4 themes: light, dark, darling, neon
│   └── security/               # Security context provider
│
├── store/                      # MobX state management
│   ├── RootStore.js            # Composed store (11 sub-stores)
│   ├── StoreContext.jsx        # React context + convenience hooks
│   └── stores/                 # 11 sub-stores
│       ├── AuthStore           # Login, register, recover, password
│       ├── UIStore             # Modals, sidebar, notifications, loading
│       ├── NodeStore           # Full node CRUD (730 lines!)
│       ├── EdgeStore           # Edge CRUD for graph connections
│       ├── SelectionStore      # Node/edge selection state
│       ├── TraversalStore      # Graph traversal
│       ├── AnalyticsStore      # Stats, streaks, heatmaps
│       ├── AIStore             # AI analysis/image requests
│       ├── EmotionsStore       # Berkeley model, ~297 lines
│       └── TagsStore           # Tag CRUD
│
├── core/                       # Data layer: entities, API, mappers
│   ├── entities/               # V2: User, Person, Tag, Emotion, Analytics
│   ├── entitiesV3/             # V3: Node, Edge, AIAnalysis, AIImage
│   ├── adapters/               # V2: API clients, mappers
│   │   ├── api/clients/        # Auth, People, Tags, Emotions, Analytics
│   │   └── api/mappers/        # User, Entry, BodyState, Circumstance, Skill
│   ├── mappersV3/              # V3: NodeMapper, EdgeMapper
│   ├── repositories/           # Abstract repository interfaces
│   └── constants/              # ENTRY_TYPES, limits
│
├── security/                   # Input sanitization (defense-in-depth)
│   ├── pipelines/              # SanitizerPipeline, AsyncSanitizerPipeline
│   │   └── presets/            # 9 presets: userInput, api, auth, search, etc.
│   ├── sanitizers/             # 17+ sanitizers across categories
│   │   ├── shared/             # HTML, Length, Trim, URL
│   │   ├── frontend/           # XSS, CSRF
│   │   ├── reflected/          # OpenRedirect, XXSI
│   │   ├── search/             # SQLi, NoSQLi
│   │   ├── files/              # FileUpload, FormulaInjection, PDFInjection
│   │   ├── structured/         # XXE, JWTValidator
│   │   └── proxies/            # HopByHopHeaders
│   ├── validators/             # Schema validation with yup-like system
│   │   └── schemas/            # auth, entry, fileUpload, search, userInput
│   └── utils/                  # patterns (17 regexes), encoders, detectors, logger
│
├── platforms/                  # Platform-specific routing
│   ├── web/router.jsx          # React Router DOM (BrowserRouter)
│   └── telegram/router.jsx     # Custom nav stack
│
└── ui/                         # React components
    ├── layouts/                # MainLayout, Navigation, TelegramLayout
    ├── pages/                  # AuthPage, CreateNodePage, SettingsPage
    └── components/             # 25+ components
        ├── analytics/          # Dashboard
        ├── auth/               # BackupCodeModal, HCaptcha, PasswordInput, StrengthIndicator
        ├── common/             # Button, Input, TextArea, Loader, Skeleton, ErrorBoundary, Modal
        ├── emotions/           # EmotionChart, EmotionPicker
        ├── layout/             # Header, SearchBar, ThemeSwitcher, LanguageSwitcher, UserProfile
        ├── nodes/              # NodeEditor + 10 feature panels
        ├── people/             # PersonCard, PersonForm, PersonList
        └── tags/               # TagsPicker
```

---

## Ключевые концепции

### Две версии ядра (V2 → V3)
- **V2** (entities/, adapters/): старая схема с Entries, BodyStates, Circumstances, Skills, Relations
- **V3** (entitiesV3/, mappersV3/): новая схема, выровнена на бэкенд — Node, Edge, AIAnalysis, AIImage

**Важно:** V2 содержит 5 отсутствующих API-клиентов (EntriesAPIClient, BodyStatesAPIClient, CircumstancesAPIClient, SkillsAPIClient, RelationsAPIClient) — экспорт есть, файлов нет. V3 — актуальная версия.

### Multi-Platform
- **Web:** полноценное приложение с BrowserRouter, Header, Bottom Navigation
- **Telegram Mini App:** использует Telegram WebApp API, MainButton/BackButton, haptic feedback, собственную навигацию через NavigationProvider

### 4 темы
- **Light:** стандартная светлая
- **Dark:** стандартная темная
- **Darling:** красно-черная
- **Neon:** тёмная с glow/pulse/flicker анимациями

### i18n
- 3 языка: ru (дефолт), en, fr
- Ключевые пути: `auth.login.title`, `common.save`
- Фоллбек: текущий язык → русский → ключ
- интерполяция: `t('hello.world', { name })` → `Привет, {name}!`

### MobX State
11 sub-stores в singleton RootStore. Каждый store — @observable/@action. Удобные хуки: `useAuthStore()`, `useNodeStore()`, etc.

---

## Таблицы

### Хуки (Layer hooks)

| Хук | Источник | Возвращает |
|------|---------|-----------|
| `usePlatform()` | layers/platform | { platform: 'web'/'telegram', config } |
| `useLanguage()` | layers/language | { language, translations, setLanguage, t() } |
| `useTheme()` | layers/theme | { theme, themeData, setTheme, themes } |
| `useSecurity()` | layers/security | { sanitizeText, sanitizeImage, validateInput, logSecurityEvent } |

### Хуки (Store hooks)

| Хук | Store | Основные данные/методы |
|------|-------|----------------------|
| `useAuthStore()` | AuthStore | user, token, isAuthenticated, login(), register(), logout() |
| `useUIStore()` | UIStore | modals, sidebar, loading, showNotification() |
| `useNodeStore()` | NodeStore | nodes[], createNode(), updateNode(), deleteNode(), specialized per type |
| `useEdgeStore()` | EdgeStore | edges[], createEdge(), fetchEdgesByNode() |
| `useTraversalStore()` | TraversalStore | traverse(), getMostConnected() |
| `useAnalyticsStore()` | AnalyticsStore | stats, fetchStats(), fetchStreaks(), etc. |
| `useAIStore()` | AIStore | requestAnalysis(), requestImage(), clearCache() |
| `useEmotionsStore()` | EmotionsStore | catalog, addEmotion(), removeEmotion() per node |
| `useTagsStore()` | TagsStore | tags[], fetchTags(), createTag(), findOrCreateTag() |

### Маршруты (Web)

| Path | Auth | Component |
|------|------|-----------|
| `/login` | Public | AuthPage (login mode) |
| `/` (home) | Protected | MainLayout → entries timeline |
| `/entries/create` | Protected | CreateNodePage → NodeEditor |
| `/settings` | Protected | SettingsPage |
| `*` | — | Navigate to / |

### Безопасность — 9 пресетов пайплайнов

| Пресет | Сanitizers | Примечание |
|--------|-----------|-----------|
| userInput | Trim → Length → HTML → XSS → SQLi → OpenRedirect | дефолт |
| api | + XXE, CSRF | API endpoints |
| auth | + strict, max 50 | auth forms |
| search | Trim → Length → SQLi → NoSQLi | search queries |
| form | Trim → Length → HTML → XSS → SQLi | generic forms |
| entryContent | + allowed HTML tags, max 10K | user content entries |
| fileUpload | FileUpload → Formula → PDF → SSXSS | file uploads |
| image | img only, max 2MB | image uploads |
| admin | max 5K, + XXE, CSRF | admin panel |

---

## DETAILED MODULE

| # | Документ | Что описывает |
|---|----------|--------------|
| 00 | [00-stencil-app-css.md](./00-stencil-app-css.md) | Vite, App.jsx, React setup, CSS variables, 4 themes, API client config |
| 01 | [01-layers.md](./01-layers.md) | Platform/Theme/Language/Security — контексты, хуки, albena |
| 02 | [02-store.md](./02-store.md) | MobX RootStore, 11 sub-stores, API каждого хранилища |
| 03 | [03-core.md](./03-core.md) | Entities V2/V3, API clients, mappers, repositories, data flow |
| 04 | [04-routing-pages.md](./04-routing-pages.md) | Web/Telegram роутеры, Protected/Public routes, Pages, Layouts |
| 05 | [05-ui-components.md](./05-ui-components.md) | 25+ компонентов: Button, Input, Auth, NodeEditor, Emotions, Tags |
| 06 | [06-security.md](./06-security.md) | 17+ санитайзеров, 9 пресетов пайплайнов, валидаторы, паттерны |

---

*Документация сгенерирована реверс-инжинирингом кодовой базы. 192 файла .JS/JSX. Последнее обновление: July 2026.*