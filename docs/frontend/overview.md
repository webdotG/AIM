# Frontend Overview

## Stack

| Component | Technology |
|-----------|------------|
| Language | JavaScript (JSX) |
| Framework | React 18.3 |
| State | MobX + mobx-react-lite |
| Routing | React Router DOM 6.30 |
| Data Fetching | React Query 3.39, Axios |
| Forms | React Hook Form 7.48 + Yup 1.3 |
| UI | React Hot Toast 2.4 for notifications |
| 3D | Three.js + React Three Fiber + Drei |
| Sanitization | DOMPurify 3.0.6 |
| Testing | Jest + React Testing Library |
| Docs | Storybook |

## Architecture

```
App (main.jsx)
    ↓
<App />                     # Root component
    ↓
<StoreProvider>            # MobX RootStore (11 sub-stores)
    ↓
<LayersProvider>           # 4 nested contexts
    ↓
  <PlatformProvider>       # Web/Telegram detection
    ↓
  <LanguageProvider>        # i18n: ru, en, fr
    ↓
  <ThemeProvider>          # 4 themes + hot swap
    ↓
<PlatformRouter />         # Web/Telegram routing
```

## State management (MobX)

| Store | Lines | Purpose |
|-------|-------|---------|
| AuthStore | 162 | Login, register, recover, token |
| UIStore | 187 | Modals, sidebar, notifications |
| NodeStore | 730 | Full CRUD for all node types |
| EdgeStore | 78 | Edge CRUD |
| SelectionStore | 32 | Node/edge selection |
| TraversalStore | 70 | Graph traversal |
| AnalyticsStore | 181 | Stats, streaks, heatmaps |
| AISTore | 122 | Analysis/image requests |
| EmotionsStore | 297 | Berkeley emotion model |
| TagsStore | 76 | Tag CRUD |

## Layers (Contexts)

### Platform Layer
- Detects platform: `web` or `telegram` detection
- **Web**: BrowserRouter + MainLayout
- **Telegram**: Telegram WebApp + custom nav stack

### Language Layer
- i18n with ru, en, fr (default ru)
- `t()` function with fallback chain
- Parameter interpolation: `t('key', { param })`
- ~636 lines per language file

### Theme Layer
- 4 themes: light, dark, darling, neon
- Hot swap via data-theme + CSS variables
- Neon theme includes glow/pulse/flicker animations

### Security Layer
- Sanitizes text content, image files
- Validates inputs against schemas
- Logs security events

## More details

For full documentation, see `README.md`.