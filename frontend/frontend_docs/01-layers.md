# LAYERS — Cross-Cutting Concerns Architecture

The `layers/` module supplies every screen in the app with four cross-cutting concerns via nested React Context providers. The sole public entry point is `<LayersProvider>`, which wraps the entire application tree (see `src/App.jsx`).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [LayersProvider](#layersprovider)
3. [Platform Layer](#1-platform-layer)
4. [Language Layer](#2-language-layer)
5. [Theme Layer](#3-theme-layer)
6. [Security Layer](#4-security-layer)
7. [Hooks at a Glance](#hooks-at-a-glance)
8. [Usage Examples](#usage-examples)
9. [File Structure](#file-structure)

---

## Architecture Overview

```
App
 ├─ StoreProvider          (state manager, separate concern)
 │
 └─ LayersProvider         (cross-cutting layers, nested providers)
      └─ PlatformProvider  ← detects web / telegram / native
           └─ LanguageProvider  ← i18n, t(), localStorage
                └─ ThemeProvider  ← light / dark / darling / neon
                     └─ children  (all app screens and components)
```

Each provider is self-contained: a `*Context.jsx` creates the context, a `*Provider.jsx` supplies the value, and a `use*()` hook gives child components access. The nesting order matters because downstream providers can depend on upstream values.

The Provider wraps NavigationProvider, which manages the cross-platform nav stack.

---

## LayersProvider

**File:** `src/layers/LayersProvider.jsx`

```jsx
<PlatformProvider>
  <LanguageProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </LanguageProvider>
</PlatformProvider>
```

Consumed in `src/App.jsx`:

```jsx
import { LayersProvider } from '@/layers';

export default function App() {
  return (
    <StoreProvider>
      <LayersProvider>
        <PlatformRouter />
      </LayersProvider>
    </StoreProvider>
  );
}
```

The module barrel re-exports the provider:

```js
// src/layers/index.js
export { LayersProvider };
export default LayersProvider;
```

---

## 1. Platform Layer

**Directory:** `src/layers/platform/`

### Purpose

Detects whether the app is running inside Telegram WebApp, a regular browser, or a native container, then supplies platform-specific configuration and a navigation stack.

### Files

| File | Role |
|---|---|
| `PlatformContext.jsx` | `createContext` with default `{ platform: 'web', config: { layout, styles, navigation } }` |
| `PlatformProvider.jsx` | Detection logic + exposes `platform` + `config`; wraps `NavigationProvider` |
| `PlatformNavigator.jsx` | `NavigationProvider` + `useNavigation()` — hand-rolled nav stack |
| `usePlatform.js` | Hook that consumes `PlatformContext` |
| `index.js` | Barrel: `PlatformContext`, `PlatformProvider`, `usePlatform`, `NavigationProvider`, `useNavigation` |

### Detection algorithm (in order)

1. **Telegram WebApp SDK** — `window.Telegram?.WebApp?.initData` or `initDataUnsafe.user`
2. **URL params** — `tgWebApp` present in `window.location.search` or `.hash`
3. **User-Agent** — `navigator.userAgent.toLowerCase()` includes `'telegram'`
4. **Default** — `'web'`

### Platform config map

```js
const platformConfig = {
  web: {
    layout: 'MainLayout',
    styles: {},
    navigation: 'stack'
  },
  telegram: {
    layout: 'TelegramLayout',
    styles: {
      backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
      textColor:      'var(--tg-theme-text-color, #000000)',
      buttonColor:    'var(--tg-theme-button-color, #2481cc)'
    },
    navigation: 'bottom-tabs'
  },
  native: {
    layout: 'NativeLayout',
    styles: {},
    navigation: 'native-stack'
  }
};
```

### PlatformNavigator — manual navigation stack

`PlatformNavigator.jsx` implements a lightweight navigation stack on top of React state:

```js
// Exposed values from NavigationContext
{
  navigate(screen, params),   // push
  goBack(),                   // pop
  replace(screen, params),    // swap top
  resetTo(screen, params),    // clear & push
  currentRoute,               // { screen, params }
  canGoBack,                  // boolean
  navigationStack             // full stack array
}
```

### Hook — `usePlatform()`

```jsx
import { usePlatform } from '@/layers/platform';

function MyScreen() {
  const { platform, config } = usePlatform();
  return <div style={config.styles}>Running on {platform}</div>;
}
```

### Hook — `useNavigation()`

```jsx
import { useNavigation } from '@/layers/platform';

function MyScreen() {
  const { navigate, goBack, currentRoute, canGoBack } = useNavigation();
  // ...
}
```

---

## 2. Language Layer

**Directory:** `src/layers/language/`

### Purpose

Full i18n with runtime switching, localStorage persistence, HTML `lang` attribute management, and a `t()` lookup function that supports nested keys, parameter interpolation, and Russian fallback.

### Supported languages

| Code | Name | Default? |
|---|---|---|
| `ru` | Русский | Yes |
| `en` | English | — |
| `fr` | Français | — |

### Files

| File | Role |
|---|---|
| `LanguageContext.jsx` | `createContext` with defaults |
| `LanguageProvider.jsx` | State, t() implementation, localStorage, `lang` attribute |
| `useLanguage.js` | Hook that consumes `LanguageContext` |
| `translations/index.js` | Barrel: `{ ru, en, fr }` |
| `translations/ru.js` | ~636 lines of translation objects |
| `translations/en.js` | English translations |
| `translations/fr.js` | French translations |
| `index.js` | Exports `LanguageProvider`, `useLanguage` |

### `t()` function algorithm

1. Split `key` on `.` to get path segments.
2. Walk nested translation object for **current language**.
3. If not found and language is not `ru`, repeat walk on **Russian translations**.
4. If still undefined, return `params.fallback` or the last path segment.
5. On a string hit, replace `{param}` placeholders from the `params` object.

```
key = 'common.entriesCount'
params = { count: 42 }
→ 'Записей: 42'   (ru)
→ 'Entries: 42'   (en)
```

### Translation object structure

The files export nested objects keyed by domain:

```js
{
  common:        { save, cancel, delete, loading, error, entriesCount: 'Записей: {count}', ... },
  auth:          { login: { title, username, password, submit }, register: { ... }, ... },
  backup_code:   { title, warning, copy, instructions..., understood },
  password:      { show, hide, generate, checking },
  passwordStrength: { title, levels: { veryWeak, weak, medium, good, strong }, ... },
  // ... 40+ more sections
}
```

### Hook — `useLanguage()`

Returns `{ language, translations, setLanguage, t }`.

```jsx
import { useLanguage } from '@/layers/language';

function LoginScreen() {
  const { t, setLanguage, language } = useLanguage();

  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('common.loading')}</p>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
    </div>
  );
}
```

### Parameter interpolation

```jsx
t('common.entriesCount', { count: 42 })   // → 'Записей: 42'
t('auth.welcome', { name: 'Alex' })       // → value with {name} replaced
```

### localStorage key

`app_language` — persisted on every change; read on initial mount. If missing, falls back to `defaultLanguage` prop (default `'ru'`).

---

## 3. Theme Layer

**Directory:** `src/layers/theme/`

### Purpose

Provides instant theme switching via a `data-theme` attribute on `<html>`, a `theme-{name}` class on `<body>`, and localStorage persistence. All CSS variable definitions live in `ok.css`; theme JS files are thin descriptors.

### Available themes

| `name` | `label` | Description |
|---|---|---|
| `light` | Светлая | Default; CSS vars via `:root` in ok.css |
| `dark` | Темная | CSS vars via `[data-theme="dark"]` |
| `darling` | Darling | Red/black palette via `[data-theme="darling"]` |
| `neon` | NEON | Dark with glow effects via `[data-theme="neon"]` |

### Files

| File | Role |
|---|---|
| `ThemeContext.jsx` | `createContext` with defaults |
| `ThemeProvider.jsx` | State, `data-theme` attribute, body class, localStorage |
| `useTheme.js` | Hook that consumes `ThemeContext` |
| `themes/light.js` | `{ name: 'light', label: 'Светлая' }` |
| `themes/dark.js` | `{ name: 'dark', label: 'Темная' }` |
| `themes/darling.js` | `{ name: 'darling', label: 'Darling' }` |
| `themes/neon.js` | `{ name: 'neon', label: 'NEON', description: 'Темная неоновая' }` |
| `themes/index.js` | Barrel |
| `index.js` | Exports `ThemeProvider`, `useTheme`, `themes` |

### ThemeProvider mechanics

```jsx
// On mount / change:
localStorage.setItem('theme', themeName);
document.documentElement.setAttribute('data-theme', themeName);
document.body.className = `theme-${themeName}`;
```

Setting `data-theme` causes ok.css to swap all CSS custom properties instantly. No JS animation is needed — the browser transitions handled purely by CSS.

### Hook — `useTheme()`

Returns `{ theme, themeData, setTheme, themes }` where:
- `theme` — current name (`'light'`, `'dark'`, etc.)
- `themeData` — the full theme descriptor object
- `setTheme(name)` — switch theme (validates against known themes, falls back to `'light'`)
- `themes` — array of `{ name, label }` objects for UI lists

```jsx
import { useTheme } from '@/layers/theme';

function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      {themes.map(t => (
        <option key={t.name} value={t.name}>{t.label}</option>
      ))}
    </select>
  );
}
```

### localStorage key

`theme` — read on initial state, written on every change. Default is `'light'`.

---

## 4. Security Layer

**Directory:** `src/layers/security/`

### Purpose

Sanitizes user-generated content (text entries, uploaded images) and validates form inputs against named JSON schemas. **Important:** `SecurityProvider` is **NOT** included in the `LayersProvider` nesting chain; it must be mounted independently (currently referenced in `App.jsx` but not wired into the nested LayersProvider).

### Files

| File | Role |
|---|---|
| `SecurityContext.jsx` | `createContext` with no-op defaults |
| `SecurityProvider.jsx` | Sanitization, validation, event logging |
| `useSecurity.js` | **Empty file** — hook not yet implemented |
| `index.js` | **Empty file** — no exports yet |

### Provider API

`SecurityProvider` accepts `children` and `enableSecurity` (boolean, default `true`). The context value is memoized and contains:

| Method | Description |
|---|---|
| `sanitizeText(text)` | Runs text through `entryContentPipeline` (imported from `@/security/pipelines/presets/entryContentPreset`). Returns sanitized string. On error, returns original. |
| `sanitizeImage(file)` | Runs file through `imagePipeline` (from `@/security/pipelines/presets/imagePreset`). Throws `Error('Invalid image file')` on failure. |
| `validateInput(input, schemaName)` | Validates against `'auth'` or `'entry'` schemas via `SchemaValidator`. Returns `{ valid: boolean, errors: [] }`. Throws on unknown schema. |
| `logSecurityEvent(event)` | Console log prefix `[SECURITY]`. TODO: server submission. |
| `isSecurityEnabled` | Boolean reflecting `enableSecurity` prop. |

### Schemas

| Name | File | Purpose |
|---|---|---|
| `auth` | `@/security/validators/schemas/authSchema` | Login/register field validation |
| `entry` | `@/security/validators/schemas/entrySchema` | Journal entry validation |

### Current gaps

- `useSecurity.js` is empty — no hook is exported.
- `index.js` is empty — no barrel exports.
- `SchemaValidator` import is commented out in `SecurityProvider.jsx` line 5 but the class is used on line 51; the code currently relies on a global or implicit hoist.
- `logSecurityEvent` prints to console only; server-side delivery is pending.

```jsx
// Hypothetical once useSecurity.js is implemented:
import { validateInput } from '@/layers/security/useSecurity';

const { valid, errors } = await validateInput(data, 'auth');
```

---

## Hooks at a Glance

| Hook | Layer | Returns | Import path |
|---|---|---|---|
| `usePlatform()` | Platform | `{ platform, config }` | `@/layers/platform` |
| `useNavigation()` | Platform | `{ navigate, goBack, replace, resetTo, currentRoute, canGoBack, navigationStack }` | `@/layers/platform` |
| `useLanguage()` | Language | `{ language, translations, setLanguage, t }` | `@/layers/language` |
| `useTheme()` | Theme | `{ theme, themeData, setTheme, themes }` | `@/layers/theme` |
| `useSecurity()` | Security | *not yet implemented* | *TODO* |

---

## Usage Examples

### Switching language from any component

```jsx
import { useLanguage } from '@/layers/language';

function LanguagePicker() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <p>{t('common.menu')}</p>
      <button onClick={() => setLanguage('ru')}>RU</button>
      <button onClick={() => setLanguage('en')}>EN</button>
      <button onClick={() => setLanguage('fr')}>FR</button>
    </div>
  );
}
```

### Theme switcher with list of available themes

```jsx
import { useTheme } from '@/layers/theme';

function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      {themes.map(t => (
        <option key={t.name} value={t.name}>{t.label}</option>
      ))}
    </select>
  );
}
```

### Platform-aware layout

```jsx
import { usePlatform } from '@/layers/platform';

function LayoutSwitcher() {
  const { platform, config } = usePlatform();

  if (platform === 'telegram') {
    return <TelegramLayout config={config} />;
  }
  return <MainLayout config={config} />;
}
```

### Navigation

```jsx
import { useNavigation } from '@/layers/platform';

function DetailScreen() {
  const { navigate, goBack, currentRoute } = useNavigation();

  return (
    <div>
      <button onClick={goBack}>Back</button>
      <button onClick={() => navigate('settings', { tab: 'appearance' })}>
        Settings
      </button>
      <p>Route: {currentRoute.screen}</p>
    </div>
  );
}
```

### Sanitizing user input

```jsx
import { useSecurity } from '@/layers/security'; // TODO: implement hook

function EntryEditor() {
  const { sanitizeText, validateInput } = useSecurity();

  const handleSubmit = async (raw) => {
    const { valid, errors } = await validateInput(raw, 'entry');
    if (!valid) return alert(errors.join(', '));

    const clean = await sanitizeText(raw.content);
    await save(clean);
  };
}
```

---

## File Structure

```
src/layers/
├── index.js                    # re-exports LayersProvider
├── LayersProvider.jsx          # nests Platform → Language → Theme
│
├── platform/
│   ├── index.js                # barrel exports
│   ├── PlatformContext.jsx     # context definition
│   ├── PlatformProvider.jsx    # detection + provider
│   ├── PlatformNavigator.jsx   # NavigationProvider + useNavigation
│   └── usePlatform.js          # usePlatform hook
│
├── language/
│   ├── index.js                # barrel: LanguageProvider, useLanguage
│   ├── LanguageContext.jsx     # context definition
│   ├── LanguageProvider.jsx    # state + t() + localStorage
│   ├── useLanguage.js          # useLanguage hook
│   └── translations/
│       ├── index.js            # { ru, en, fr }
│       ├── ru.js               # ~636 lines
│       ├── en.js
│       └── fr.js
│
├── theme/
│   ├── index.js                # ThemeProvider, useTheme, themes
│   ├── ThemeContext.jsx        # context definition
│   ├── ThemeProvider.jsx       # data-theme + body class + localStorage
│   ├── useTheme.js             # useTheme hook
│   └── themes/
│       ├── index.js            # { light, dark, darling, neon }
│       ├── light.js
│       ├── dark.js
│       ├── darling.js
│       └── neon.js
│
└── security/
    ├── index.js                # EMPTY — no exports
    ├── SecurityContext.jsx     # context with no-op defaults
    ├── SecurityProvider.jsx    # sanitize + validate + log
    └── useSecurity.js          # EMPTY — hook not yet implemented
```