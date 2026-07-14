# Routing & Pages

## Overview

The frontend uses a **platform-aware routing strategy**. `PlatformRouter` detects the runtime platform and delegates to either the Web router (React Router DOM) or the Telegram router (custom state-based navigation). This ensures the web app behaves like a traditional SPA while the Telegram Mini App integrates with Telegram's native UI patterns.

## Architecture

```
PlatformRouter              ← Detects platform
 ├── WebRouter              ← React Router DOM (BrowserRouter)
 │    ├── PublicRoute       ← Guards /login, /register
 │    └── ProtectedRoute    ← Guards all authenticated routes
 └── TelegramRouter         ← Custom state-based navigation
      └── TelegramLayout    ← Observer-backed layout + nav
```

---

## Entry Point: PlatformRouter

**File:** `src/PlatformRouter.jsx` (19 lines)

`PlatformRouter` is the root routing component. It uses `usePlatform()` to determine the current platform and renders the appropriate router:

| Platform    | Rendered Component |
|-------------|-------------------|
| `telegram`  | `<TelegramRouter />` |
| `web` / default | `<WebRouter />` |

```jsx
const PlatformRouter = () => {
  const { platform } = usePlatform();
  switch(platform) {
    case 'telegram': return <TelegramRouter />;
    case 'web': default: return <WebRouter />;
  }
};
```

No global routing state exists outside of each platform's own router.

---

## Web Router

**File:** `src/platforms/web/router.jsx` (47 lines)

Uses React Router DOM's `BrowserRouter`. Defines two route guard wrappers and all application routes.

### Route Guards

#### ProtectedRoute
- **Purpose:** Restricts access to authenticated users.
- **Behavior:** Reads `useAuthStore().isAuthenticated`. If `true`, renders children. If `false`, redirects to `/login` with `replace`.

#### PublicRoute
- **Purpose:** Restricts access to unauthenticated users.
- **Behavior:** If `isAuthenticated` is `true`, redirects to `/`. Otherwise renders children (the auth page).

### Route Table

| Path              | Guard          | Layout        | Page Component   | Description                   |
|-------------------|---------------|---------------|-----------------|------------------------------|
| `/login`          | `PublicRoute`  | *(none)*      | `AuthPage`      | Login / Register / Recover   |
| `/`               | `ProtectedRoute` | `MainLayout` | `CreateNodePage` (index) | Home — entries timeline / create |
| `/create`         | `ProtectedRoute` | `MainLayout` (nested) | `CreateNodePage` | Create a new node entry      |
| `/*` (catch-all)  | `ProtectedRoute` | `MainLayout` (nested) | `Navigate to /`  | Fallback redirect            |

**Note:** The routes for `/settings` and `/analytics` described in the initial spec are not yet implemented in `router.jsx`. The bottom `Navigation` component includes links to `/settings` and `/analytics`, but the corresponding `<Route>` definitions do not exist yet.

### Route Hierarchy

```
<BrowserRouter>
  <Routes>
    <Route path="/login" → PublicRoute → AuthPage />

    <Route path="/" → ProtectedRoute → MainLayout>
      <Route index → CreateNodePage />
      <Route path="create" → CreateNodePage />
      <Route path="*" → Navigate to / />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## Telegram Router

**File:** `src/platforms/telegram/router.jsx` (35 lines)

**Does NOT use React Router.** Navigation is managed through local state shared between `TelegramRouter`, `RouterContent`, and `TelegramLayout` via props.

### Routing Mechanism

- `currentRoute` state lives in `RouterContent` — possible values: `'home'`, `'create'`, `'settings'`.
- `TelegramLayout` receives `navigate` (setter) and `currentRoute` as props and triggers navigation through button callbacks.
- No URL changes occur; navigation is purely internal state transitions.
- The component is wrapped with `observer` from `mobx-react-lite` for reactive rendering.

### Route Table (Telegram)

| Route Key | Component       | Description         |
|-----------|----------------|---------------------|
| `home`     | `CreateNodePage` | Default — entries / create |
| `create`   | `CreateNodePage` | Node editor         |
| `settings` | `SettingsPage`  | Settings screen     |

The `analytics` route key is referenced in the navigation UI but does not yet have a distinct `case` in `RouterContent`'s switch statement — it falls through to the default (`CreateNodePage`).

### Auth Handling

If `authStore.isAuthenticated` is `false`, `TelegramRouter` renders `<AuthPage />` directly (no layout wrapped around it). Once authenticated, it renders `<TelegramLayout>` with `<RouterContent>` inside.

---

## Pages

### AuthPage

**File:** `src/ui/pages/auth/AuthPage.jsx` (351 lines)

A single-page component that dynamically switches between three authentication modes via local `mode` state: `'login'`, `'register'`, `'recover'`.

#### Modes

| Mode     | Fields Shown                                           | Store Action        |
|----------|--------------------------------------------------------|---------------------|
| `login`   | `login` (text), `password` (password)                  | `authStore.login()` |
| `register`| `login`, `password` + strength + generate, `confirmPassword` | `authStore.register()` |
| `recover` | `backupCode`, `newPassword`                            | `authStore.recover()` |

All three modes require **hCaptcha** verification. The submit button is disabled until `hcaptchaToken` is populated.

#### Registration Flow

1. User fills login, password (with strength indicator and optional password generation), and confirmPassword.
2. On submit, `authStore.register()` is called with `{ login, password, hcaptchaToken }`.
3. Server returns a `backupCode`.
4. `BackupCodeModal` is displayed — user **must** copy or note the code before proceeding.
5. Closing the modal navigates to `/`.

#### Recovery Flow

1. User enters their backup code and a new password.
2. On submit, `authStore.recover()` is called with `{ backupCode, newPassword: password, hcaptchaToken }`.
3. Server returns a new `backupCode`.
4. `BackupCodeModal` is displayed.
5. Closing the modal navigates back to `/login`.

#### Validation Rules

- **Register:** `password === confirmPassword`, `passwordStrength.isStrong` must be `true`.
- **All modes:** `hcaptchaToken` must be present.
- All text content is internationalized via `useLanguage().t()`.

#### State Management

| Local State          | Purpose                                    |
|----------------------|--------------------------------------------|
| `mode`               | Current auth mode (`login` / `register` / `recover`) |
| `login`              | Login field value                          |
| `password`           | Password field value                       |
| `confirmPassword`    | Confirm password field value               |
| `backupCode`         | Backup code field value                    |
| `hcaptchaToken`      | hCaptcha verification token                |
| `loading`            | Submit in-progress flag                    |
| `error`              | Error message to display                   |
| `passwordStrength`   | Strength indicator data                    |
| `showBackupCode`     | Whether BackupCodeModal is visible         |
| `generatedBackupCode`| The backup code from server response       |
| `copied`             | Clipboard copy confirmation flag           |

#### Mode Switching

The footer contains link buttons that toggle `mode` state and reset relevant fields:
- Login → Register: resets `error`, `hcaptchaToken`
- Login → Recover: resets `error`, `hcaptchaToken`
- Register/Recover → Login: resets `error`, `password`, `confirmPassword`, `backupCode`, `hcaptchaToken`

---

### CreateNodePage

**File:** `src/ui/pages/nodes/CreateNodePage.jsx` (12 lines)

Thin wrapper component. Renders `<NodeEditor />` inside a `.create-node-page` container div. No proprietary logic; all node creation behavior lives in the `NodeEditor` component.

---

### SettingsPage

**File:** `src/ui/pages/settings/SettingsPage.jsx` (36 lines)

Settings screen with three sections:

| Section        | Current Content                          |
|---------------|------------------------------------------|
| **Profile**   | Displays `user.login` from `localStorage` |
| **Interface** | Themed heading; theme/language selectors planned (UI elements not yet rendered) |
| **Data**      | Themed heading; analytics stats planned (fetches from `/api/v1/analytics/stats`) |

Uses `useTheme()` and `useLanguage()` hooks. User data is read directly from `localStorage` — `JSON.parse(localStorage.getItem('user') || '{}')`.

---

## Layouts

### MainLayout

**File:** `src/ui/layouts/MainLayout.jsx` (23 lines)

The primary layout wrapper for web authenticated routes. Structure:

```
<div class="main-layout">
  <Header />          ← Conditionally rendered (web only)
  <main class="main-content">
    <Outlet />        ← React Router nested content
  </main>
  <Navigation />      ← Conditionally rendered (web only)
</div>
```

`Header` and `Navigation` are hidden when `usePlatform().isTelegram` is `true`. The `<Outlet />` renders child route content (`CreateNodePage`, etc.).

---

### Navigation

**File:** `src/ui/layouts/Navigation.jsx` (48 lines)

Bottom navigation bar rendered within `MainLayout`. Uses React Router's `NavLink` for active-state tracking.

| Item     | Path             | Label (default) |
|---------|-----------------|----------------|
| Timeline| `/`              | Лента          |
| Create  | `/entries/create` | Создать       |
| Analytics | `/analytics`    | Аналитика      |
| Settings| `/settings`      | Настройки      |

Active item receives the CSS class `active` via `NavLink`'s `className` function. The home route (`/`) uses `end={true}` to match only the exact path. Label values are internationalized via `useLanguage().t()`, with fallback text.

**Note:** The `nav-icon` span exists in the JSX but is currently commented out.

---

### TelegramLayout

**File:** `src/ui/layouts/TelegramLayout.jsx` (164 lines)

Observer component (`mobx-react-lite`) specifically for the Telegram Mini App. Does **not** use any React Router components.

#### Props

| Prop           | Type    | Source              |
|---------------|---------|---------------------|
| `children`    | node    | Page component from `RouterContent` |
| `navigate`    | function| Route state setter from `TelegramRouter` |
| `currentRoute`| string  | Current route key (`home` / `create` / `settings`) |

#### Telegram WebApp Integration

- **MainButton:** Showed on `home` route with text from `t('entries.form.submit')`. Click handler is wired but the creation logic placeholder logs to console (`console.log('Create entry clicked')`).
- **BackButton:** Showed when `currentRoute !== 'home'`. Clicking navigates back to `home`.
- **Haptic feedback:** Invoked via `utils.hapticFeedback('light')` on menu toggle and navigation actions.
- **User badge:** Displays `telegramUser.firstName` from `usePlatform()` if available.

#### UI Sections

| Section         | Description                                                    |
|----------------|----------------------------------------------------------------|
| Header        | Hamburger menu button + "AIM Journal" title + user badge       |
| Side Menu     | Slide-in overlay with home / analytics / settings buttons      |
| Content       | `<main class="tg-content">` — renders children prop            |
| Bottom Nav    | 3 buttons: entries / analytics / settings                      |

Active state is determined by comparing `currentRoute` against each item's key string. Both the side menu and bottom nav reflect the same active state.

#### Navigation Flow

```
User clicks nav item
  → handleNavigate(route) called
  → navigate(route) updates currentRoute state
  → setShowMenu(false) closes side menu if open
  → utils.hapticFeedback('light') provides tactile response
  → Observer re-renders with new active state + children
```