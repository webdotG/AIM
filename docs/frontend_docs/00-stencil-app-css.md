# Stencil App — Frontend Architecture & CSS

## Overview

This document describes the frontend project stencil: its build configuration, entry point, provider tree, routing strategy, global CSS system (themes, variables, utilities, components), API client setup, and shared constants.

---

## Tech Stack

| Category              | Library                                  | Version    |
|-----------------------|------------------------------------------|------------|
| **UI Framework**       | React                                    | 18.3.1     |
| **Build Tool**         | Vite + @vitejs/plugin-react              | 7.3.0      |
| **State Management**   | MobX + mobx-react-lite                    | 6.15 / 4.1 |
| **Routing**            | react-router-dom                         | 6.30.2     |
| **Data Fetching**      | react-query                              | 3.39.3     |
| **Forms**              | react-hook-form                          | 7.48.2     |
| **Notifications**      | react-hot-toast                          | 2.4.1      |
| **Scroll Detection**   | react-intersection-observer              | 9.5.3      |
| **3D Rendering**       | Three.js + @react-three/fiber + drei     | —          |
| **HTML Sanitization**  | dompurify                                | 3.0.6      |
| **Cookies**            | js-cookie                                | 3.0.5      |
| **Validation**         | yup                                      | 1.3.3      |
| **Captcha**            | @hcaptcha/react-hcaptcha                 | —          |
| **Testing / A11y**     | Jest, React Testing Library, axe Storybook | —        |

---

## NPM Scripts

| Script            | Command                              | Description                              |
|-------------------|--------------------------------------|------------------------------------------|
| `dev`             | `vite`                               | Dev server on port **5173** (host: true) |
| `build`           | `vite build`                         | Production build into `dist/`            |
| `preview`         | `vite preview`                       | Preview production build locally         |
| `test`            | `jest`                               | Run Jest test suite                      |
| `test:watch`      | `jest --watch`                       | Run tests in watch mode                  |
| `lint`            | `eslint src --ext .js,.jsx --max-warnings=0` | Lint src; zero warnings tolerance |
| `format`          | `prettier --write src`               | Auto-format all files under `src/`       |
| `storybook`       | `storybook dev -p 6006`              | Storybook dev server on port 6006        |
| `build-storybook` | `storybook build`                    | Static Storybook build                   |

---

## Vite Configuration

**File:** `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':     path.resolve(__dirname, 'src'),
      '@layers': path.resolve(__dirname, 'src/layers'),
      '@store':  path.resolve(__dirname, 'src/store'),
      '@ui':     path.resolve(__dirname, 'src/ui'),
      '@core':   path.resolve(__dirname, 'src/core'),
    }
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

### Path Aliases

| Alias       | Resolves to                     | Purpose                                          |
|-------------|---------------------------------|--------------------------------------------------|
| `@`         | `src/`                          | Root source directory                            |
| `@layers`   | `src/layers/`                   | Context providers (Platform, Language, Theme)    |
| `@store`    | `src/store/`                    | MobX stores and StoreProvider                    |
| `@ui`       | `src/ui/`                       | Reusable UI components                           |
| `@core`     | `src/core/`                     | Domain logic: entities, repos, adapters, constants |

---

## Entry Point — `main.jsx`

**File:** `src/main.jsx` (7 lines)

```jsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './ok.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

**What it does:**
1. Imports React 18's `createRoot` from `react-dom/client` (concurrent rendering API).
2. Imports the root `App` component.
3. Imports the global stylesheet `ok.css`.
4. Mounts `<App />` onto the `<div id="root">` element from `index.html`.

---

## App Component — Provider Tree

**File:** `src/App.jsx` (14 lines)

```jsx
import { LayersProvider } from '@/layers';
import { StoreProvider } from '@/store/StoreContext';
import PlatformRouter from './PlatformRouter';

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

### Three-Layer Nesting

```
<StoreProvider>                   ← MobX RootStore singleton
  <LayersProvider>                ← Platform, Language, Theme contexts
    <PlatformRouter />            ← Web or Telegram routing
  </LayersProvider>
</StoreProvider>
```

| Provider         | Source                           | Responsibility                                                  |
|------------------|----------------------------------|-----------------------------------------------------------------|
| **StoreProvider** | `@/store/StoreContext`          | Wraps the entire app with a MobX `RootStore` singleton for reactive state. |
| **LayersProvider** | `@/layers`                      | Provides React contexts for `Platform`, `Language`, and `Theme`. |
| **PlatformRouter** | `./PlatformRouter`              | Delegates to `WebRouter` (`BrowserRouter`) or `TelegramRouter` based on platform context. |

### PlatformRouter

**File:** `src/PlatformRouter.jsx`

```jsx
import { usePlatform } from '@/layers/platform/usePlatform';
import WebRouter      from '@/platforms/web/router';
import TelegramRouter from '@/platforms/telegram/router';

const PlatformRouter = () => {
  const { platform } = usePlatform();
  switch (platform) {
    case 'telegram': return <TelegramRouter />;
    case 'web':
    default:         return <WebRouter />;
  }
};
export default PlatformRouter;
```

The router reads the current platform from the `usePlatform()` hook and renders either:
- **`WebRouter`** — standard `BrowserRouter` for web apps.
- **`TelegramRouter`** — custom router adapted for Telegram Web Apps.

---

## Global CSS — `ok.css` (891 lines)

**File:** `src/ok.css`

A single global stylesheet driving the entire visual system. No CSS-in-JS; everything flows through CSS custom properties and theme-derived selectors.

### Design Philosophy

- **Pure spectrum colors** — `blue`, `purple`, `green`, `orange`, `red`, `cyan` (no hex in the default theme).
- **Only black and white** for backgrounds, text, borders, and state colors in the default theme.
- **Zero border-radius** — all `--border-radius-*` variables resolve to `0`.
- **Shadows = solid borders** — `box-shadow: 0 0 0 Npx black` (crisp outline effect).
- **All-caps serif typography** — headings and links use `text-transform: uppercase; letter-spacing: 1px`.

---

### CSS Custom Properties

#### Colors (default / light theme)

| Variable                         | Value                           |
|----------------------------------|---------------------------------|
| `--color-primary`                | `blue`                          |
| `--color-secondary`              | `purple`                        |
| `--color-success`                | `green`                         |
| `--color-warning`                | `orange`                        |
| `--color-danger`                 | `red`                           |
| `--color-info`                   | `cyan`                          |
| `--color-background`             | `white`                         |
| `--color-surface`                | `white`                         |
| `--color-card`                   | `white`                         |
| `--color-paper`                  | `white`                         |
| `--color-text`                   | `black`                         |
| `--color-text-secondary`         | `black`                         |
| `--color-text-disabled`          | `black`                         |
| `--color-text-inverse`           | `white`                         |
| `--color-border`                 | `black`                         |
| `--color-divider`                | `black`                         |
| `--color-hover`                  | `black`                         |
| `--color-active`                 | `black`                         |
| `--color-selected`               | `black`                         |
| `--color-disabled`               | `black`                         |
| `--color-overlay`                | `black`                         |
| `--color-shadow`                 | `black`                         |

**Transparent variants** — Each semantic color has a `rgba(..., 0.1)` counterpart (e.g., `--color-primary-transparent: rgba(0, 0, 255, 0.1)`).

#### Typography

| Variable                   | Value                          |
|----------------------------|--------------------------------|
| `--font-family`            | `san-serif`                    |
| `--font-serif`             | `san-serif`                    |
| `--font-mono`              | `'Courier New', monospace`     |
| `--font-size-xs`           | `0.75rem`                      |
| `--font-size-sm`           | `0.875rem`                     |
| `--font-size-base`         | `1rem`                         |
| `--font-size-lg`           | `1.125rem`                     |
| `--font-size-xl`           | `1.25rem`                      |
| `--font-size-2xl`          | `1.5rem`                       |
| `--font-size-3xl`          | `1.875rem`                     |
| `--font-size-4xl`          | `2.25rem`                      |
| `--font-weight-normal`     | `400`                          |
| `--font-weight-medium`     | `500`                          |
| `--font-weight-semibold`   | `600`                          |
| `--font-weight-bold`       | `700`                          |

#### Spacing

| Variable            | Value     |
|---------------------|-----------|
| `--spacing-xs`      | `0.25rem` |
| `--spacing-sm`      | `0.5rem`  |
| `--spacing-md`      | `1rem`    |
| `--spacing-lg`      | `1.5rem`  |
| `--spacing-xl`      | `2rem`    |
| `--spacing-2xl`     | `3rem`    |

#### Border Radius (all zero)

| Variable                  | Value |
|---------------------------|-------|
| `--border-radius-sm`      | `0`   |
| `--border-radius-md`      | `0`   |
| `--border-radius-lg`      | `0`   |
| `--border-radius-xl`      | `0`   |
| `--border-radius-full`    | `0`   |

#### Shadows (solid outlines)

| Variable           | Value                           |
|--------------------|---------------------------------|
| `--shadow-sm`      | `0 0 0 1px black`               |
| `--shadow-md`      | `0 0 0 2px black`               |
| `--shadow-lg`      | `0 0 0 3px black`               |
| `--shadow-xl`      | `0 0 0 4px black`               |
| `--shadow-2xl`     | `0 0 0 5px black`               |

#### Z-Indices

| Variable                | Value |
|-------------------------|-------|
| `--z-dropdown`          | `1000`|
| `--z-sticky`            | `1020`|
| `--z-fixed`             | `1030`|
| `--z-modal-backdrop`    | `1040`|
| `--z-modal`             | `1050`|
| `--z-popover`           | `1060`|
| `--z-tooltip`           | `1070`|
| `--z-toast`             | `1080`|

#### Container Widths

| Variable            | Value     |
|---------------------|-----------|
| `--container-sm`    | `640px`   |
| `--container-md`    | `768px`   |
| `--container-lg`    | `1024px`  |
| `--container-xl`    | `1280px`  |
| `--container-2xl`   | `1536px`  |

#### Transitions & Easings

| Variable               | Value                                      |
|------------------------|--------------------------------------------|
| `--transition-fast`    | `150ms`                                    |
| `--transition-normal`  | `300ms`                                    |
| `--transition-slow`    | `500ms`                                    |
| `--ease-in-out`        | `cubic-bezier(0.4, 0, 0.2, 1)`             |
| `--ease-out`           | `cubic-bezier(0, 0, 0.2, 1)`               |
| `--ease-in`            | `cubic-bezier(0.4, 0, 1, 1)`               |

---

### Theme System

Themes are toggled via `data-theme` attribute on `<html>` or `<body>`.

#### 1. Light (default `:root`)

Clean, high-contrast black-and-white palette with pure-spectrum accent colors.

#### 2. Dark (`[data-theme="dark"]`)

Inverts the light theme: black backgrounds, white text, white borders. Accent colors (blue, purple, etc.) remain unchanged. Shadows become white outlines.

#### 3. Darling (`[data-theme="darling"]`)

Red/black aesthetic. Every accent color maps to `red`. Black backgrounds, white text, red borders and state colors. Transparent variants use `rgba(255, 0, 0, 0.1)`. Shadows become red outlines.

#### 4. Neon (`[data-theme="neon"]`)

Cyberpunk glow theme with saturation-pure neon colors:

| Variable            | Neon Value          |
|---------------------|---------------------|
| `--color-primary`   | `#00ffff` (cyan)    |
| `--color-secondary` | `#ff00ff` (magenta) |
| `--color-success`   | `#00ff00` (green)   |
| `--color-warning`   | `#ffff00` (yellow)  |
| `--color-danger`    | `#ff0066` (pink)    |
| `--color-info`      | `#00ffff` (cyan)    |

Backgrounds gradient from deep black (`#0a0a0a` → `#1a1a1a`). Shadows are multi-layer `box-shadow` with cyan glow at increasing radii (5px–120px, 5 layers). Transparent variants use `rgba(..., 0.15)`.

##### Neon Animations

| Keyframe              | Property        | Effect                                             |
|-----------------------|-----------------|----------------------------------------------------|
| `neonPulse`           | `text-shadow`   | 5-layer glow pulses from medium to intense over 3s |
| `neonFlicker`         | `opacity` + `text-shadow` | Simulates a failing neon sign at specific keyframes (20%, 24%, 55%) |
| `neonBorderPulse`     | `box-shadow`    | Pulsing outer + inner glow on borders over 2s      |
| `neonGlow`            | `filter`        | `brightness()` + `drop-shadow()` oscillation        |

##### Neon Element Overrides

- **`body`** — dual radial gradient overlay (cyan top, magenta bottom) on `#000000`.
- **H1–H3** — 5-layer `text-shadow` + `neonPulse` animation.
- **H4–H6** — 3-layer `text-shadow`, no animation.
- **`p`, `span`** — light 2-layer glow.
- **`a`** — dual glow; on hover adds 4 layers + `neonPulse` at 1.5s.
- **`.btn`** — outer glow, inner glow, pulsing `::before` border on hover.
- **`.btn-primary`** — cyan border, cyan text, 8% cyan background.
- **`.card`** — translucent cyan bg, animated `::after` radial glow, `::before` inner border glow.
- **`.header`** — frosted backdrop (`blur(10px)`), multi-layer shadow, animated gradient underline via `neonFlicker`.
- **`.header-title`** — `neonPulse` animation + 4-layer text glow.
- **`.switcher-dropdown` / `.dropdown-option`** — frosted bg, inner glow, hover states with intensified shadow.
- **Scrollbar** — glowing cyan thumb with inset shadow; hover intensifies.
- **Inputs/textarea/select** — translucent cyan bg, dual glow borders, focus amplifies to 3-layer shadow.

---

### Base Styles

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; ... }
body { min-height: 100vh; text-rendering: optimizeLegibility; ... }
```

- Full CSS reset on `box-sizing`, `margin`, `padding`.
- Smooth scroll on `html`.
- Antialiased font rendering (`-webkit-font-smoothing`, `-moz-osx-font-smoothing`).
- Background and text color transitions at `300ms`.

### Typography Rules

- **Headings** (h1–h6): `font-weight: bold`, `line-height: 1.2`, `font-family: --font-serif`, `text-transform: uppercase`, `letter-spacing: 1px`. Margin bottom: `--spacing-sm`.
- **Paragraphs**: `margin-bottom: --spacing-md`, uses `--font-serif`.
- **Links**: `--color-primary`, bold, uppercase, `letter-spacing: 1px`. Hover: `opacity: 0.81` (underline commented out).

---

### Utility Classes

#### Text Color

`.text-primary` (blue), `.text-secondary` (purple), `.text-success` (green), `.text-warning` (orange), `.text-danger` (red), `.text-info` (cyan), `.text-disabled`, `.text-inverse`.

#### Background

`.bg-primary` (blue), `.bg-secondary` (purple), `.bg-success`, `.bg-warning`, `.bg-danger`, `.bg-info`, `.bg-background`, `.bg-surface`, `.bg-card`.

#### Padding

`.p-0` through `.p-5` map to `0` → `--spacing-xl`.

#### Margin

`.m-0` through `.m-4` map to `0` → `--spacing-lg`.

#### Flexbox

| Class             | Declaration                        |
|-------------------|------------------------------------|
| `.flex`           | `display: flex`                    |
| `.flex-col`       | `flex-direction: column`           |
| `.items-center`   | `align-items: center`              |
| `.justify-center` | `justify-content: center`          |
| `.justify-between`| `justify-content: space-between`   |
| `.gap-1`          | `gap: --spacing-xs`                |
| `.gap-2`          | `gap: --spacing-sm`                |
| `.gap-3`          | `gap: --spacing-md`                |
| `.gap-4`          | `gap: --spacing-lg`                |

#### Borders & Radius

`.border` (1px), `.border-2` (2px), `.border-3` (3px). `.rounded`, `.rounded-lg`, `.rounded-full` (all resolve to `border-radius: 0`).

#### Shadows

`.shadow-sm`, `.shadow` (md), `.shadow-lg`.

---

### Component Styles

#### `.container`

Full-width, centered, `padding: 0 var(--spacing-md)`, 1px border. Responsive `max-width` breakpoints: 640 → `--container-sm`, 768 → `--container-md`, 1024 → `--container-lg`, 1280 → `--container-xl`.

#### `.btn`

`inline-flex`, centered content, `padding: sm × md`, 2px border, bold, uppercase, `letter-spacing: 1px`. Uses `--font-serif`. Background: `--color-background`, text: `--color-text`.

Hover (not disabled): inverts to `--color-text` bg, `--color-background` text.

#### `.card`

`--color-card` background, 2px border, `--spacing-lg` padding, `position: relative`.

`::before` pseudo-element: inset 4px border (decorative inner frame), `pointer-events: none`.

---

### Scrollbar Customization

Webkit: 8px width/height, track uses `--color-background`, thumb uses `--color-border`, thumb hover uses `--color-primary`.

Firefox fallback via `scrollbar-width: thin` and `scrollbar-color`.

---

## API Client Configuration

**File:** `src/core/adapters/config.js` (63 lines)

### Axios Instance

```js
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
```

- Reads `VITE_API_URL` from environment; falls back to `http://localhost:3003/api/v1`.
- Request timeout: **10 seconds**.

### Request Interceptor

```js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Attaches JWT from `localStorage('auth_token')` to every outgoing request.

### Response Interceptor

**Success path** — unwraps `response.data` so callers receive the payload directly (no `.data` access needed).

**Error path:**
1. On **401** (unauthorized):
   - Clears `auth_token`, `user_id`, and `user` from localStorage.
   - If the failing request was not to `/auth/login` or `/auth/register`:
     - After 100ms delay (to let components handle the error), redirects to `/auth` if current path is not already an auth route.
2. Extracts error message from `response.data.message` / `response.data.error` / `error.message` / fallback `'Network error'`.
3. Returns `Promise.reject` with a normalized `{ message, status, data }` object.

---

## Constants

**File:** `src/core/constants/entries.js`

### Entry Types

```js
export const ENTRY_TYPES = {
  NOTE:   'note',
  MEMORY: 'memory',
  PLAN:   'plan',
  GOAL:   'goal',
  EVENT:  'event',
};
```

### Entry Type Icons

```js
export const ENTRY_TYPE_ICONS = {
  [ENTRY_TYPES.NOTE]:   '\u{1F4DD}',  // 📝
  [ENTRY_TYPES.MEMORY]: '\u{1F9E0}',  // 🧠
  [ENTRY_TYPES.PLAN]:   '\u{1F4C5}',  // 📅
  [ENTRY_TYPES.GOAL]:   '\u{1F3AF}',  // 🎯
  [ENTRY_TYPES.EVENT]:  '\u{1F389}',  // 🎉
};
```

### Limits

| Constant              | Value | Purpose                              |
|-----------------------|-------|--------------------------------------|
| `MAX_CONTENT_LENGTH`  | `5000` | Maximum characters for entry content |
| `MAX_TAGS`            | `10`   | Maximum tags per entry               |
| `MAX_EMOTIONS`        | `5`    | Maximum emotions per entry           |

---

## Source Directory Structure (Key Folders)

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component + provider tree
├── PlatformRouter.jsx          # Platform-aware router delegation
├── ok.css                      # Global stylesheet (themes, utilities, components)
├── layers/                     # Context providers (@/layers alias)
├── store/                      # MobX stores + StoreProvider (@/store alias)
├── ui/                         # Reusable UI components (@/ui alias)
├── core/
│   ├── adapters/
│   │   ├── config.js           # Axios API client with interceptors
│   │   └── api/                # API clients + data mappers
│   ├── constants/
│   │   └── entries.js          # Entry types, icons, limits
│   ├── entities/               # Domain entity classes (v2)
│   ├── entitiesV3/             # Domain entity classes (v3: Node, Edge, AIAnalysis, AIImage)
│   ├── mappersV3/              # V3 entity mappers
│   └── repositories/           # Data access layer (BaseRepository + domain repos)
└── platforms/
    ├── web/router              # BrowserRouter-based web routing
    └── telegram/router         # Telegram WebApp-adapted routing
```