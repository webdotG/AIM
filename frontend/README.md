# AIM Frontend — Life Graph Editor

## Статус

| Параметр | Значение |
|----------|----------|
| Версия модели | **V3 (Graph Architecture)** — переписываем |
| Текущее состояние | Старая модель Entry/BodyState/Circumstance/Skill -> новая Graph V3 |
| Задача | Слив фронтенда с готовым бэкендом |

---

## Стек

- **Framework:** React 18
- **Build:** Vite 7
- **State:** MobX 6 (singleton RootStore + React Context)
- **Routing:** React Router DOM (Web) / state-based (Telegram Mini App)
- **Forms:** React Hook Form + Yup
- **Request:** Axios (interceptored)
- **Testing:** Jest + React Testing Library
- **UI:** React Three Fiber (граф), Storybook
- **Тесты:** Jest, Storybook
- **CSS:** CSS Modules-风格的 scoped CSS with CSS variables

---

## Архитектура (Target V3)

```
App
  └─ StoreProvider (MobX singleton)
       └─ LayersProvider
            ├─ PlatformProvider    — Web / Telegram detection
            ├─ LanguageProvider    — i18n (ru/en/fr)
            └─ ThemeProvider       — CSS variables, data-theme
                 └─ PlatformRouter

PlatformRouter → WebRouter (React Router) | TelegramRouter (state-based)
```

### Слои (Layers) — НЕ ТРОГАТЬ

| Слой | Назначение | Статус |
|------|-----------|--------|
| `Platform` | Детекция Web/Telegram, навигация | ✅ Сохраняем |
| `Theme` | CSS, home, Theme
|   | Layout
| `language` | i18n (ru/en/fr) | ✅ Сохраняем |
| `Security` | sanitizeText, validateInput | ✅ Сохраняем |

### Stores (Надлежащая модель V3)

| Store | Назначение | Статус |
|-------|-----------|--------|
| `AuthStore` | Авторизация, токен | ✅ Сохраняем |
| `UIStore` | Модалы, сайдбар, нотификации | ✅ Сохраняем |
| `EmotionsStore` | Каталог 27 эмоций, выбор, интенсивность | ✅ Сохраняем |
| `TagsStore` | CRUD тегов, findOrCreate | ✅ Сохраняем |
| **GraphStore** | **Главный: nodes, edges, traverse, connect** | 🆕 Создание |
| **AnalyticsStore** | Статистика профиля, emotion-timeline, streaks | 📨 Обновление |
| **AIStore** | AI-анализ узлов, генерация изображений | 🆕 Создание |

### Импортированные существующие для удаления

| Store / Entity | Причина | Замена |
|---|--------|--------|
| `EntriesStore` | Старая model | `GraphStore` |
| `BodyStatesStore` | Устарела | `Measurement` через `GraphStore` |
| `CircumstancesStore` | Устарела | Node типа Place, Weather, etc. |
| `SkillsStore` | Устарела | `Characteristic` (вычисляемая) |
| `SkillProgressStore` | Устарела | measurement + analytics |
| `RelationsStore` | Устарела | `Edge` через `GraphStore` |
| `EntryDraftStore` | Старая model | `NodeDraftStore` |

### API Clients (Target V3)

| Client | Endpoint | Статус |
|--------|----------|--------|
| `AuthAPIClient` | `/auth/*` | ✅ Сохраняем |
| **NodesAPIClient** | `/graph/nodes` | 🆕 Заменяет EntriesAPIClient |
| **EdgesAPIClient** | `/graph/edges`, `/graph/traversal` | 🆕 Заменяет RelationsAPIClient |
| `EmotionsAPIClient` | `/emotions/*` | 🔄 Обновить пути |
| `TagsAPIClient` | `/tags/*` | 🔄 Обновить пути |
| **PeopleAPIClient** | `/people/*` | 🆕 Новый |
| **MeasurementsAPIClient** | `/measurements/node/:nodeId` | 🆕 Новый |
| **AnalyticsAPIClient** | `/analytics/*` | 🔄 Обновить пути |
| **AIAPIClient** | `/ai/*` | 🆕 Новый |

### Entities (Domain Model V3)

```
Node              — базовая сущность графа
  id: UUID
  nodeTypeCode: 'dream' | 'thought' | 'memory' | 'plan' | 'action' | 'person' | 'place' | 'book' | ...
  title
  createdAt
  deletedAt

Edge              — связь между двумя узлами
  id: number
  fromNodeId: UUID
  toNodeId: UUID
  edgeTypeCode: 'mentions' | 'caused' | 'resulted_in' | 'inspired' | ...
  confidence: 0-1
  weight
  notes

Emotion           — эмоция Berkeley
  id: number
  nameRu, nameRu
  category: 'positive' | 'negative' | 'neutral'
  intensity: 1-10

Tag               — пользовательский тег
  id: number
  name: string

Measurement       — измерение узла
  measurementId: number (reference)
  value: integer | decimal | boolean | text
  unit: string

AIAnalysis        — результат AI-анализа
  id: number
  analysisType: string
  result: string

AIImage           — сгенерированное изображение
  id: number
  imageUrl: string
  prompt: string
```

### Pages / Routes

```
/login         → AuthPage
/              → MainLayout (ProtectedRoute)
  /            → TimelinePage           (ли轴线 графа)
  /nodes/create  → CreateNodePage       (универсальный редактор)
  /nodes/:id     → NodeDetailPage       (детали узла + граф связей)
  /graph         → GraphViewPage        (визуализация графа)
  /people        → PeoplePage
  /analytics     → AnalyticsPage
  /settings      → SettingsPage
```

### Компоненты редактора (Composable)

```
NodeEditor (base)
  ├─ DreamPlugin       — lucidity, vividness, nightmare, sleep_start/end
  ├─ ThoughtPlugin     — importance, confidence
  ├─ MemoryPlugin      — event_date, confidence
  ├─ PlanPlugin        — deadline, priority, completed
  ├─ ActionPlugin      — activity_id, started_at, finished_at
  ├─ EmotionPlugin     — 27 Berkeley эмоций с интенсивностью
  ├─ TagsPlugin        — CRUD тегов, findOrCreate
  ├─ MeasurementsPlugin — Measurement по activity
  ├─ PeoplePlugin      — связь с людьми через Edge
  ├─ GraphPlugin       — Edge picker, connect to other nodes
  └─ AIPlugin          — request analysis / image, display results
```

---

## Security

- `XCOR, HELMET, rate limiting, sanitization` handled on backend
- Frontend: `Layer` sanitizer (sanitizerConfig.js, SecurityProvider)

## Platform

- **Web:** React Router, MainLayout
- **Telegram:** state-based nav, TelegramLayout, MainButton/BackButton

## Команды

```bash
npm run dev                # Vite dev server
npm run build              # Production build
npm test                   # Jest
npm run lint               # ESLint
npm run storybook          # Storybook
```