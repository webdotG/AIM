# UI Components

Comprehensive reference for all UI components in `src/ui/components/`.

---

## Table of Contents

- [Common Components](#common-components)
  - [Button](#button) - [Input](#input) - [TextArea](#textarea)
  - [Loader](#loader) - [Skeleton](#skeleton) - [DotsLoader](#dotsloader)
  - [Modal](#modal) - [ErrorBoundary](#errorboundary)
- [Auth Components](#auth-components)
  - [PasswordInput](#passwordinput) - [PasswordStrengthIndicator](#passwordstrengthindicator)
  - [BackupCodeModal](#backupcodemodal) - [HCaptcha](#hcaptcha)
- [Layout Components](#layout-components)
  - [Header](#header) - [SearchBar](#searchbar)
  - [ThemeSwitcher](#themeswitcher) - [LanguageSwitcher](#languageswitcher) - [UserProfile](#userprofile)
- [Node Components](#node-components)
  - [NodeEditor](#nodeeditor) - [Type-Specific Feature Panels](#type-specific-feature-panels)
- [Emotion Components](#emotion-components) - [EmotionPicker](#emotionpicker)
- [Tag Components](#tag-components) - [TagsPicker](#tagspicker)
- [Analytics Components](#analytics-components)

---
## Common Components

### Button

**File:** `src/ui/components/common/Button/Button.jsx`

Versatile button with variant styling, size options, loading state, and icon support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button label content |
| `onClick` | `function` | - | Click handler; ignored when disabled or loading |
| `variant` | `string` | `'primary'` | Visual style; maps to `.button--{variant}` |
| `size` | `string` | `'medium'` | One of: `small`, `medium`, `large`; maps to `.button--{size}` |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Replaces children with Spinner; disables click |
| `icon` | `ReactNode` | `null` | Leading icon in `.button__icon` |
| `fullWidth` | `boolean` | `false` | Adds `.button--full-width` |
| `type` | `string` | `'button'` | Native button type (button, submit, reset) |

#### Generated CSS Classes

| Condition | Class |
|-----------|-------|
| Always | `button` |
| Variant | `button--{variant}` (e.g. `button--primary`) |
| Size | `button--{size}` (e.g. `button--medium`) |
| Disabled | `button--disabled` |
| Loading | `button--loading` |
| Full width | `button--full-width` |

#### Behavior

- `loading=true` replaces children with internal `Spinner`; click suppressed.
- `icon` renders in `<span className="button__icon">` when not loading.
- Children render in `<span className="button__text">`.
- Both `disabled` and `loading` set native `disabled` attribute.
- Internal `Spinner` accepts `size` (small/medium/large, default medium) mapping to `.spinner--{size}`.

---

### Input

**File:** `src/ui/components/common/Input/Input.jsx`

Text input with label, error, character counter, focus styling, and leading icon.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value |
| `onChange` | `function(string)` | - | Called with new string (not the event) |
| `type` | `string` | `'text'` | Native input type (text, password, number, date, etc.) |
| `placeholder` | `string` | `''` | Placeholder text |
| `label` | `string` | `''` | Label; renders `<label>` when non-empty |
| `error` | `string` | `''` | Error message; renders `.input-error` when non-empty |
| `disabled` | `boolean` | `false` | Disables; adds `.is-disabled` |
| `required` | `boolean` | `false` | Adds `*` to label and native `required` |
| `icon` | `ReactNode` | `null` | Leading icon; adds `.has-icon` |
| `maxLength` | `number` | `null` | Native maxLength; character counter when set |
| `autoFocus` | `boolean` | `false` | Auto-focuses on mount |
| `onBlur` | `function(Event)` | `null` | Called on native blur |
| `onFocus` | `function(Event)` | `null` | Called on native focus |

#### Wrapper CSS Classes

| Condition | Class |
|-----------|-------|
| Always | `input-wrapper` |
| Has error | `has-error` |
| Focused | `is-focused` |
| Disabled | `is-disabled` |
| Has icon | `has-icon` |

#### DOM Structure

```
div.input-wrapper
  label.input-label                           (only if label)
    span.required-mark                        (only if required)
  div.input-container
    span.input-icon                           (only if icon)
    input.input-field
  div.input-error                             (only if error)
  div.input-counter                           (only if maxLength and no error)
```

#### Behavior

- `onChange` receives `e.target.value` (string, not full event).
- Focus via `useState`; `handleFocus`/`handleBlur` also call `onFocus`/`onBlur`.
- When `maxLength` set and no error, shows character counter.
- Error display takes priority over character counter.

---

### TextArea

**File:** `src/ui/components/common/Input/TextArea.jsx`

Multiline text input. Similar API to Input but omits icon; uses `<textarea>`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value |
| `onChange` | `function(Event)` | - | Native onChange (full event) |
| `placeholder` | `string` | `''` | Placeholder |
| `label` | `string` | `''` | Label |
| `error` | `string` | `''` | Error message |
| `disabled` | `boolean` | `false` | Disables |
| `required` | `boolean` | `false` | Adds `*` to label |
| `maxLength` | `number` | `null` | Character counter when set |
| `rows` | `number` | `4` | Textarea rows |
| `autoFocus` | `boolean` | `false` | Auto-focuses |

#### Differences from Input

- `onChange` receives **full event** (callers extract `e.target.value`).
- No `icon` or `type` props. Has `rows` prop.
- No `onFocus`/`onBlur` callbacks.

---

### Loader

**File:** `src/ui/components/common/Loader/Loader.jsx`

CSS spinner with size, text, and fullscreen mode. Uses `@keyframes spin` (rotate 360deg, 0.8s linear infinite).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `string` | `'medium'` | `small` (20px), `medium` (40px), `large` (60px) |
| `text` | `string` | `''` | Loading message below spinner |
| `fullscreen` | `boolean` | `false` | Fixed overlay, z-index 9999 |
| `color` | `string` | `var(--color-primary, #007bff)` | Spinner borderTop color |

#### Size Mapping

| Size | Diameter | Border | Text size |
|------|----------|--------|-----------|
| `small` | 20px | 2px | 13px |
| `medium` | 40px | 4px | 14px |
| `large` | 60px | 6px | 16px |

#### Fullscreen Mode

When `fullscreen=true`: fixed position, `background: rgba(255,255,255,0.9)`, `z-index: 9999`.

---

### Skeleton

**File:** `src/ui/components/common/Loader/Skeleton.jsx`

Shimmer placeholder. `shimmer` keyframe (1.5s infinite) animates `background-position` from `200% 0` to `-200% 0`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `string`/`number` | `'100%'` | Block width |
| `height` | `string`/`number` | `'20px'` | Block height |
| `borderRadius` | `string` | `'4px'` | Corner radius |
| `count` | `number` | `1` | Number of blocks vertically |
| `gap` | `string` | `'8px'` | Gap between blocks |

---

### DotsLoader

**File:** `src/ui/components/common/Loader/DotsLoader.jsx`

Three-dot bounce animation. `bounce` keyframes (1.4s infinite ease-in-out) with staggered delays.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `string` | `'medium'` | `small` (6px), `medium` (10px), `large` (14px) |
| `color` | `string` | `var(--color-primary, #007bff)` | Dot background |

Three circles scale 0->1->0. Delays: -0.32s, -0.16s, 0s. Gap equals dot size.

---

### Modal

**File:** `src/ui/components/common/Modal/Modal.jsx`

Full-featured modal with overlay, sizes, animations, dismissal, and compositional APIs.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls visibility |
| `onClose` | `function` | - | Called on close (overlay, Escape, button) |
| `title` | `string` | `''` | Header title; ignored when `header` set |
| `children` | `ReactNode` | - | Body content |
| `size` | `string` | `'medium'` | `xs` (320px), `sm` (400px), `md` (600px), `lg` (800px), `xl` (1000px), `fullscreen` (95vw), or any CSS value |
| `closeOnOverlay` | `boolean` | `true` | Close on overlay click |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `header` | `ReactNode` | `null` | Custom header; supersedes `title` |
| `footer` | `ReactNode` | `null` | Custom footer |
| `animationType` | `string` | `'slide-up'` | `slide-up`, `fade`, `scale`, `none` |
| `animationDuration` | `number` | `300` | Duration in ms |
| `disableBodyScroll` | `boolean` | `true` | Lock body scroll |
| `disableEscapeClose` | `boolean` | `false` | Prevent Escape close |
| `hideHeader` | `boolean` | `false` | Hide header entirely |
| `hideFooter` | `boolean` | `true` | Hide footer when no custom footer |
| `onOpen` | `function` | `() => {}` | On open lifecycle |
| `onCloseStart` | `function` | `() => {}` | Before close lifecycle |
| `classNamePrefix` | `string` | `'modal'` | Prefix for all generated CSS classes |
| `closeButtonContent` | `string` | `'x'` | Close button content |

#### CSS Class / Style Props

Each element has `*ClassName` and `*Style` props: `overlay`, `modal`, `header`, `title`, `body`, `footer`, `closeButton`.

#### Generated Classes (default prefix)

| Element | Class |
|---------|-------|
| Overlay | `modal__overlay {overlayClassName}` |
| Dialog | `modal {modalClassName} modal--{animationType}` |
| Header | `modal__header {headerClassName}` |
| Title | `modal__title {titleClassName}` |
| Body | `modal__body {bodyClassName}` |
| Footer | `modal__footer {footerClassName}` |
| Close btn | `modal__close-button {closeButtonClassName}` |

#### withDefaultFooter HOC

Wraps a modal with Cancel/Confirm footer buttons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `confirmText` | `string` | `t('common.confirm')` | Confirm label |
| `cancelText` | `string` | `t('common.cancel')` | Cancel label |
| `onConfirm` | `function` | - | Confirm handler |
| `onCancel` | `function` | - | Cancel; falls back to `onClose` |
| `showCancel` | `boolean` | `true` | Show cancel |
| `showConfirm` | `boolean` | `true` | Show confirm |
| `confirmButtonProps` | `object` | `{}` | Extra props |
| `cancelButtonProps` | `object` | `{}` | Extra props |
| `footerAlign` | `string` | `'right'` | `left`, `center`, `right` |

#### Pre-configured Modals

| Export | Title | Size | Notes |
|--------|-------|------|-------|
| `ConfirmModal` | Confirmation | `sm` | Cancel + Confirm |
| `AlertModal` | Notification | `sm` | OK only |
| `FormModal` | Form | `md` | Cancel + Confirm |

#### useModal Hook

Returns `{ isOpen, open, close, toggle, modalProps }` where `modalProps = { isOpen, onClose: close }`.

---

### ErrorBoundary

**File:** `src/ui/components/common/ErrorBoundary/ErrorBoundary.jsx`

Class component using React error boundary pattern (`getDerivedStateFromError` + `componentDidCatch`).

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Tree to wrap; replaced on error |

#### Behavior

- On error, renders `<ErrorFallback error={error}>` (warning icon, title, message, Reload/Go Home buttons).
- Errors logged via `console.error`. Uses `useLanguage()` hook.

#### CSS Classes

| Element | Class |
|---------|-------|
| Container | `.error-boundary` |
| Content | `.error-content` |
| Icon | `.error-icon` |
| Title | `.error-title` |
| Message | `.error-message` |
| Actions | `.error-actions` |
| Primary | `.error-button .primary` |
| Secondary | `.error-button .secondary` |

#### useErrorBoundary() Hook

Returns `{ error, handleError, clearError, ErrorBoundaryComponent }`.

---

## Auth Components

### PasswordInput

**File:** `src/ui/components/auth/PasswordInput/PasswordInput.jsx`

Password field with show/hide toggle, debounced server strength check, and optional password generation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled password |
| `onChange` | `function(string)` | - | New password string |
| `label` | `string` | `t('auth.password.label')` | Field label |
| `placeholder` | `string` | `t('auth.password.placeholder')` | Placeholder |
| `showStrengthIndicator` | `boolean` | `true` | Show strength bar and server check |
| `showGenerateButton` | `boolean` | `false` | Show Generate button |
| `required` | `boolean` | `false` | Required indicator |
| `onStrengthChange` | `function(object)` | `null` | Callback with `{ score, isStrong, reasons, suggestions }` |
| `...props` | `Input props` | - | Forwarded to Input |

#### Strength Check Flow

1. Debounced 500ms via `useDebounce` before server check.
2. Length < 3 resets to `{ score: 0, isStrong: false, reasons: [], suggestions: [] }`.
3. Calls `authStore.checkPasswordStrength(password)` async.
4. During check (`isChecking`), shows indicator.
5. Result via `<PasswordStrengthIndicator>`.
6. `onStrengthChange` called with both reset and server result.

#### CSS Classes

| Element | Class |
|---------|-------|
| Wrapper | `.password-input-wrapper` |
| Show/hide | `.password-toggle` |
| Generate | `.password-generate` |
| Strength | `.password-strength-wrapper` |
| Checking | `.checking-indicator` |

---

### PasswordStrengthIndicator

**File:** `src/ui/components/auth/PasswordStrengthIndicator/PasswordStrengthIndicator.jsx`

Visual strength bar with level label, progress fill, and requirements checklist.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `number` | - | Score 0-100; bar width |
| `isStrong` | `boolean` | - | All requirements met; success message |
| `reasons` | `string[]` | `[]` | Failed requirements |
| `suggestions` | `string[]` | `[]` | Suggestions |

#### Strength Levels

| Score | i18n key | CSS class |
|-------|----------|-----------|
| >= 80 | `passwordStrength.levels.strong` | `strong` |
| >= 60 | `passwordStrength.levels.good` | `good` |
| >= 40 | `passwordStrength.levels.medium` | `medium` |
| >= 20 | `passwordStrength.levels.weak` | `weak` |
| < 20 | `passwordStrength.levels.veryWeak` | `very-weak` |

#### CSS Classes

| Element | Class |
|---------|-------|
| Container | `.password-strength-indicator` |
| Header | `.strength-header` |
| Label | `.strength-label` |
| Value | `.strength-value` |
| Bar track | `.strength-bar` |
| Bar fill | `.strength-fill .{level}` |
| Requirements | `.strength-requirements` |
| List | `.requirements-list` |
| Failed item | `.requirement-item .error` |
| Success | `.strength-success` |

---

### BackupCodeModal

**File:** `src/ui/components/auth/BackupCodeModal/BackupCodeModal.jsx`

Modal for one-time backup code with copy-to-clipboard. Overlay click and Escape disabled.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Visibility |
| `onClose` | `function` | - | Close handler |
| `backupCode` | `string` | - | Code to display |
| `title` | `string`/`null` | `t('auth.backup_code.title')` | Title |
| `warning` | `string`/`null` | `null` | Warning text |
| `instructions` | `string`/`null` | `null` | Additional text |
| `showCopyButton` | `boolean` | `true` | Copy button |
| `showCloseButton` | `boolean` | `true` | Header close button |

#### Behavior

- Wraps `Modal` with `size="md"`, `closeOnOverlay=false`, `disableEscapeClose=true`.
- Copy: `navigator.clipboard.writeText(backupCode)`; 2s copied state on success.
- Footer: Understood button to close.

#### CSS Classes

| Element | Class |
|---------|-------|
| Content | `.backup-code-modal-content` |
| Warning | `.backup-warning` |
| Code display | `.backup-code-display` |
| Code text | `.backup-code-text` |
| Hints | `.backup-code-hint` |

---

### HCaptcha

**File:** `src/ui/components/auth/HCaptcha/HCaptcha.jsx`

Wrapper around `@hcaptcha/react-hcaptcha` with dev bypass and `MutationObserver` style injection.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onVerify` | `function(string)` | - | Verification token callback |
| `onError` | `function(string)` | - | Error callback |
| `onExpire` | `function` | - | Token expiry callback |
| `theme` | `string` | `'light'` | hCaptcha theme |
| `isDevMode` | `boolean` | `import.meta.env.DEV` | Dev bypass |

#### Dev Mode

- `onVerify` always called (generates `dev-bypass-token-{ts}`).
- `onError` triggers auto-verify (`dev-error-bypass-{ts}`).
- `onExpire` auto-renews (`dev-renewed-token-{ts}`).

#### Style Injection (MutationObserver)

- iframe: `border-radius: 8px`, `overflow: hidden`.
- Warning text/elements: red background.
- Status text/elements: green background.
- Privacy/Terms: `font-size: 10px`, `opacity: 0.7`.

#### Site Key

`VITE_HCAPTCHA_SITE_KEY` env; fallback `10000000-ffff-ffff-ffff-000000000001`.

---

## Layout Components

### Header

**File:** `src/ui/components/layout/Header.jsx`

Top navigation bar. No props - self-contained.

#### Composition

| Position | Content |
|----------|---------|
| Left (`.header-brand`) | `<h1>AIM</h1>` + `<UserProfile />` |
| Center | `<SearchBar />` |
| Right (`.header-right`) | `<ThemeSwitcher />` + `<LanguageSwitcher />` |

#### CSS Classes

| Element | Class |
|---------|-------|
| Root | `.header` |
| Brand | `.header-brand` |
| Title | `.header-title` |
| Right | `.header-right` |

---

### SearchBar

**File:** `src/ui/components/layout/SearchBar.jsx`

Search with category filter dropdown. Navigates to `/search?q=...&categories=...`. No props.

#### Categories

| ID | Icon | i18n key |
|----|------|----------|
| `all` | S | `search.all` |
| `entries` | E | `search.entries` |
| `skills` | S | `search.skills` |
| `people` | P | `search.people` |
| `tags` | # | `search.tags` |

#### Behavior

- Selecting All deselects others (mutually exclusive).
- Click outside closes dropdown.
- Telegram: `utils.hapticFeedback('light')` on interaction.
- Submit: URLSearchParams, `navigate('/search?...')`, clears input.

#### CSS Classes

| Element | Class |
|---------|-------|
| Root | `.search-bar` (+ `.telegram` or `.web`) |
| Form | `.search-form` |
| Input wrapper | `.search-input-wrapper` |
| Input | `.search-input` |
| Submit | `.search-button` |
| Category btn | `.category-prefix` |
| Dropdown | `.categories-dropdown` |
| Option | `.category-option` (+ `.selected`) |

---

### ThemeSwitcher

**File:** `src/ui/components/layout/ThemeSwitcher.jsx`

Theme dropdown. No props - uses `useTheme()`.

- Button: current theme label from `availableThemes` + arrow.
- Click theme: `setTheme(name)`, closes dropdown.
- Click outside: closes dropdown.

#### CSS Classes

| Element | Class |
|---------|-------|
| Root | `.theme-switcher` |
| Button | `.switcher-button` |
| Label | `.switcher-button-label` |
| Arrow | `.switcher-button-arrow` |
| Dropdown | `.switcher-dropdown` |
| Option | `.dropdown-option` (+ `.selected`) |

---

### LanguageSwitcher

**File:** `src/ui/components/layout/LanguageSwitcher.jsx`

Language dropdown. No props - uses `useLanguage()`.

#### Available Languages

| Code | Label | Button |
|------|-------|--------|
| `ru` | Russian | RU |
| `en` | English | EN |
| `fr` | French | FR |

Same CSS pattern as ThemeSwitcher: `.language-switcher`, `.switcher-button`, `.switcher-dropdown`, `.dropdown-option`, `.selected`.

---

### UserProfile

**File:** `src/ui/components/layout/UserProfile.jsx`

Auth display: login name + logout. No props.

- Returns `null` when not authenticated.
- Shows `authStore.user.login` (fallback: `User`).
- Logout: `authStore.logout()` then `navigate('/login')`.
- Loading text when `authStore.isLoading`.

#### CSS Classes

| Element | Class |
|---------|-------|
| Container | `.user-profile` |
| Login text | `.user-profile-login` |
| Logout | `.user-profile-logout` |

---

## Node Components

### NodeEditor

**File:** `src/ui/components/nodes/NodeEditor.jsx` (143 lines)

Node creation form with type selector, title/content, and feature panels. No props - MobX observer consuming `nodeStore`, `emotionsStore`, `tagsStore`, `aiStore`.

#### Node Types

| Type ID | Label |
|---------|-------|
| `dream` | Dream |
| `thought` | Thought |
| `memory` | Memory |
| `plan` | Plan |
| `action` | Action |

#### Internal State

| State | Type | Default |
|-------|------|---------|
| `nodeType` | `string` | `'dream'` |
| `title` | `string` | `''` |
| `content` | `string` | `''` |
| `errors` | `object` | `{}` |

#### Submit Flow

1. Validates title and content (non-empty after trim). Errors stored in `errors.title`/`errors.content`.
2. Calls `nodeStore.createNode({ title, content, type: nodeType })`.
3. Success: clears title/content, resets type to `dream`, calls `emotionsStore.clearSelection()`, `tagsStore.clearSelection()`, `aiStore.clearCache()`.
4. Error: stores `errors.form = error.message`.

#### CSS Classes

| Element | Class |
|---------|-------|
| Root | `.node-editor` |
| Header | `.node-editor__header` |
| Type selector | `.node-editor__type-selector` |
| Type btn | `.node-editor__type-btn` (+ `.active`) |
| Error | `.node-editor__error` |
| Fields | `.node-editor__fields` |
| Type badge | `.node-editor__type-badge` |
| Features | `.node-editor__features` |
| Actions | `.node-editor__actions` |

---

### Type-Specific Feature Panels

All in `src/ui/components/nodes/features/`. Each ~15 lines, wrapped in `observer()`, renders `<div className="settings-panel">`.

#### DreamSettings
**File:** `src/ui/components/nodes/features/DreamSettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `setContent` | `function` | Content setter |
Renders: Lucidity (1-10, number), Vividness (1-10, number).

#### ThoughtSettings
**File:** `src/ui/components/nodes/features/ThoughtSettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `setContent` | `function` | Content setter |
Renders: Importance (1-10, number), Confidence (1-10, number).

#### MemorySettings
**File:** `src/ui/components/nodes/features/MemorySettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `setContent` | `function` | Content setter |
Renders: Event date (date), Confidence (1-10, number).

#### PlanSettings
**File:** `src/ui/components/nodes/features/PlanSettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `setContent` | `function` | Content setter |
Renders: Deadline (date), Priority (1-10, number).

#### ActionSettings
**File:** `src/ui/components/nodes/features/ActionSettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `setContent` | `function` | Content setter |
Renders: Start (datetime-local), End (datetime-local).

#### EmotionSettings
**File:** `src/ui/components/nodes/features/EmotionSettings.jsx`
No props. Placeholder panel: uses `useEmotionsStore()`.

#### TagsSettings
**File:** `src/ui/components/nodes/features/TagsSettings.jsx`
No props. Placeholder panel: uses `useTagsStore()`.

#### MeasurementsSettings
**File:** `src/ui/components/nodes/features/MeasurementsSettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `nodeType` | `string` | Current node type |
Placeholder panel: uses `useNodeStore()`.

#### GraphSettings
**File:** `src/ui/components/nodes/features/GraphSettings.jsx`
No props. Placeholder panel: uses `useEdgeStore()` and `useNodeStore()`.

#### AISettings
**File:** `src/ui/components/nodes/features/AISettings.jsx`
| Prop | Type | Description |
|------|------|-------------|
| `nodeType` | `string` | Current node type |
Placeholder panel: uses `useAIStore()`.

---

## Emotion Components

### EmotionPicker

**File:** `src/ui/components/emotions/EmotionPicker/EmotionPicker.jsx`

Berkeley emotion picker with intensity slider. Two modes: standalone or draft-integrated. MobX observer.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedEmotions` | `array` | `[]` | Current selection (standalone mode) |
| `onChange` | `function(array)` | - | New selection callback (standalone) |
| `onClose` | `function` | - | Close handler |
| `draftStore` | `object` | - | Draft store ref (draft mode) |
| `draftField` | `string` | `'emotions'` | Draft field name |
| `maxEmotions` | `number` | `5` | Max emotions allowed |

#### Modes

- **Standalone**: uses `selectedEmotions` / `onChange` directly.
- **Draft**: when `draftStore` provided, writes to `draftStore.currentDraft[draftField]`.

#### Three-Step Workflow

1. **Category**: choose positive, negative, or neutral.
2. **Emotion**: pick from `emotionsStore.emotionsCatalog` for chosen category.
3. **Intensity**: slider 0-100, snapped to steps [5, 25, 50, 75, 90, 99, 100].

#### Internal State

| State | Type | Default |
|-------|------|---------|
| `selectedCategory` | `string`/`null` | `null` |
| `selectedEmotion` | `object`/`null` | `null` |
| `intensity` | `number` | `50` |
| `currentStep` | `string` | `'category'` |

#### Selected Emotion Data Shape

| Field | Type | Description |
|-------|------|-------------|
| `category.id` | `string` | `positive`, `negative`, or `neutral` |
| `category.label` | `string` | Display label |
| `category.icon` | `string` | Category icon |
| `emotion.id` | `string` | Emotion ID from catalog |
| `emotion.label` | `string` | Display name |
| `emotion.icon` | `string` | Emotion icon |
| `intensity` | `number` | 0-100 |

#### Actions

- `handleCategorySelect` -> emotion step
- `handleEmotionSelect` -> intensity step
- `handleBack` -> previous step
- `handleAddEmotion` -> appends selection, resets to category
- `handleRemoveEmotion(index)` -> removes by index
- `handleClearAll` -> empty array
- `handleUpdateIntensity(index, value)` -> adjust existing

#### CSS Classes (selected)

| Element | Class |
|---------|-------|
| Root | `.emotion-picker` |
| Selected section | `.selected-emotions` |
| Selected item | `.selected-emotion-item` |
| Remove button | `.remove-emotion-button` |
| Intensity slider | `.selected-intensity-slider` |
| Category card | `.category-card` (+ `.selected`) |
| Emotion card | `.emotion-card` (+ `.selected`) |
| Intensity track | `.intensity-track-fill` |
| Slider input | `.intensity-slider` |
| Mark | `.intensity-mark` (+ `.active`) |
| Add button | `.add-emotion-button` |
| Clear all | `.clear-all-button` |
| Back button | `.back-button` |
| Loading state | `.step-content .loading` |

---

## Tag Components

### TagsPicker

**File:** `src/ui/components/tags/TagsPicker.jsx`

Tag selection/creation component. Two modes: standalone or draft-integrated. MobX observer.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedTags` | `string[]` | `[]` | Current selection (standalone) |
| `onChange` | `function(string[])` | - | New selection callback |
| `onClose` | `function` | - | Close handler |
| `draftStore` | `object` | - | Draft store ref (draft mode) |
| `draftField` | `string` | `'tags'` | Draft field name |
| `maxTags` | `number` | `10` | Maximum tags |

#### Modes

- **Standalone**: uses `selectedTags` / `onChange` directly.
- **Draft**: writes to `draftStore.currentDraft[draftField]`.

#### Tag Validation

| Rule | Details |
|------|---------|
| Min length | 2 characters |
| Max length | 50 characters |
| Max count | configurable via `maxTags` (default 10) |
| Uniqueness | no duplicates |
| Normalization | trimmed, lowered to lowercase |

#### Behavior

- Popular tags loaded from `tagsStore.fetchPopularTags()`; fallback to hardcoded list.
- Input triggers autocomplete suggestions (max 5) filtered from popular tags.
- Enter adds tag. Backspace on empty input removes last tag.
- Escape closes suggestions dropdown. Click outside closes dropdown.
- After adding tag: input cleared, refocused via `setTimeout(0)`.

#### Internal State

| State | Type | Description |
|-------|------|-------------|
| `inputValue` | `string` | Current input text |
| `suggestions` | `string[]` | Autocomplete suggestions |
| `showSuggestions` | `boolean` | Dropdown visibility |
| `localError` | `string`/`null` | Validation error message |
| `isLoading` | `boolean` | Popular tags loading |

#### CSS Classes

| Element | Class |
|---------|-------|
| Root | `.tags-picker` |
| Selected section | `.selected-tags-section` |
| Count | `.selected-count` |
| Clear all | `.clear-all-button` |
| Selected list | `.selected-tags-list` |
| Tag item | `.selected-tag-item` |
| Tag text | `.tag-text` |
| Remove | `.remove-tag-button` |
| Error | `.error-message` |
| Input section | `.tag-input-section` |
| Input wrapper | `.input-wrapper` |
| Input | `.tag-input` |
| Hint | `.input-hint` |
| Loading | `.loading-indicator` |
| Quick tags title | `.quick-tags-title` |
| Quick tag | `.quick-tag` |
| Suggestions dropdown | `.suggestions-dropdown` |
| Suggestion item | `.suggestion-item` |
| Suggestions text | `.suggestion-text` |
| Hint | `.suggestion-hint` |
| Instructions | `.instructions` |

---

## Analytics Components

### AnalyticsDashboard Stories

**File:** `src/ui/components/analytics/AnalyticsDashboard.stories.jsx`

Storybook stories for the analytics dashboard. Contains demo mock components.

#### Exports

| Story | Description |
|-------|-------------|
| `Default` | Fullscreen dashboard with stat cards, emotion chart, skill progress |
| `MobileView` | Same layout, viewport set to mobile |
| `DarkTheme` | Same layout, dark background |

#### Demo Components

| Component | Props | Description |
|-----------|------|-------------|
| `StatCard` | `title`, `value`, `change` | Stat card with percentage change indicator |
| `EmotionChart` | `emotions` | Bar chart of emotion distribution |
| `SkillsProgress` | `skills` | Progress bars for skill levels |

#### Mock Data

Uses `mockEntries`, `mockSkills`, `mockEmotions` from `../entries/mocks`. Aggregate entry type counts and generate random emotion counts for demo.

---

_Documentation generated from source files in `src/ui/components/`._
