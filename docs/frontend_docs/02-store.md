# MobX State Management Layer

## Overview

The AIM frontend uses **MobX** (`makeAutoObservable`, `runInAction`) as its state management solution. A single `RootStore` instance composes 11 sub-stores, made available to React components via React Context and dedicated custom hooks.

## Architecture

```
RootStore (singleton)
├── auth  — AuthStore
├── ui    — UIStore
├── emotions  — EmotionsStore
├── tags  — TagsStore
├── nodes  — NodeStore
├── edges  — EdgeStore
├── selection  — SelectionStore
├── traversal  — TraversalStore
├── analytics  — AnalyticsStore
└── ai   — AIStore
```

### Provider Pattern

```
src/store/RootStore.js       ← class, instantiates 11 sub-stores
src/store/StoreContext.jsx   ← singleton instance + React context + hooks
src/store/index.js           ← barrel re-export
```

`StoreContext.jsx` creates a single `RootStore` instance at module level, wraps it in `StoreContext.Provider`, and exports convenience hooks.

### Dependency Graph

```
                    ┌──────────┐
                    │ RootStore │
                    └────┬─────┘
          ┌──────┬───────┼─────────┬──────────┬──────────┐
          ▼      ▼       ▼         ▼          ▼          ▼
     ┌──────┐┌──────┐┌───────┐┌────────┐┌───────┐┌──────────┐
     │ Auth │ │  UI  │ │ Emotions│ │ Nodes│ │ Edges │ │Selection│
     └──┬───┘└──┬───┘└───┬───┘└───┬────┘└───┬───┘└────────┘
        │        │        │        │         │
        │        │        │        │         │
     (no root) (no root) │    ┌───▼────┐    │
                         │    │Traversal│    │
                         │    └───┬────┘    │
                         │    ┌───▼────┐    │
                         │    │Analytics│    │
                         │    └───┬────┘    │
                         │    ┌───▼────┐    │
                         │    │  AI    │    │
                         │    └────────┘    │
        + ┌────────┐ + ┌───────┐
        + │Analytics│ + │ Tags  │
        + └────────┘ + └───────┘

Stores that receive rootStore: Auth, Emotions, Tags, Node, Edge,
  Selection, Traversal, Analytics, AI
Stores that are standalone:   UI
```

---

## Convenience Hooks

All hooks are exported from `src/store/StoreContext.jsx`. They are also re-exported from `src/store/index.js`.

| Hook | Property | Store Class |
|---|---|---|
| `useStores()` | — | RootStore |
| `useAuthStore()` | `.auth` | AuthStore |
| `useUIStore()` | `.ui` | UIStore |
| `useEmotionsStore()` | `.emotions` | EmotionsStore |
| `useTagsStore()` | `.tags` | TagsStore |
| `useNodeStore()` | `.nodes` | NodeStore |
| `useEdgeStore()` | `.edges` | EdgeStore |
| `useSelectionStore()` | `.selection` | SelectionStore |
| `useTraversalStore()` | `.traversal` | TraversalStore |
| `useAnalyticsStore()` | `.analytics` | AnalyticsStore |
| `useAIStore()` | `.ai` | AIStore |

### Legacy Stub Hooks

The following hooks are exported from both `StoreContext.jsx` and `index.js` as temporary stubs for legacy components. They return empty objects/no-op functions and are scheduled for removal.

| Stub Hook | Return Shape |
|---|---|
| `useSkillsStore()` | `{ skills: [], createSkill: async () => {} }` |
| `useCircumstancesStore()` | `{ circumstances: [] }` |
| `useBodyStatesStore()` | `{ bodyStates: [], createBodyState: async () => {} }` |
| `useRelationsStore()` | `{ relations: [], createRelation: async () => {} }` |
| `useSkillProgressStore()` | `{ addProgress: async () => {} }` |
| `useEntriesStore()` | `{ entries: [], createEntry: async () => {}, fetchEntries: async () => {} }` |
| `useEntryDraftStore()` | `{ currentDraft: {}, updateDraft: () => {}, clearDraft: () => {} }` |

---

## Store APIs

### 1. AuthStore

**File:** `src/store/stores/AuthStore.js` (162 lines)

Handles user authentication, session persistence, and password utilities.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `user` | `object \| null` | Currently logged-in user (persisted in localStorage) |
| `token` | `string \| null` | Auth token (persisted in localStorage) |
| `isAuthenticated` | `boolean` *(computed)* | `!!this.token` |
| `isLoading` | `boolean` | Loading state for auth actions |
| `error` | `string \| null` | Last error message |

**Actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `login({ login, password, hcaptchaToken })` | credentials | `Promise<data>` | Authenticate user, persist token and user in localStorage |
| `register({ login, password, hcaptchaToken })` | credentials | `Promise<{ user, token, backupCode }>` | Register new user, auto-login on success |
| `recover({ backupCode, newPassword, hcaptchaToken })` | recovery data | `Promise<{ message, backupCode }>` | Password recovery via backup code, then fetches current user |
| `fetchCurrentUser()` | — | `Promise<void>` | Verify token with `/auth/verify`, update user data |
| `logout()` | — | `void` | Clear token/user from state and localStorage, redirect to `/auth` |
| `checkPasswordStrength(password)` | `string` | `Promise<{ isStrong, score, reasons, suggestions }>` | Validate password strength via API |
| `generatePassword()` | — | `Promise<string>` | Generate a recommended password via API |

**API client:** `AuthAPIClient`  
**Mapper:** `UserMapper.toDomain()`

---

### 2. UIStore

**File:** `src/store/stores/UIStore.js` (187 lines)

Standalone store (does not receive `rootStore`). Manages all transient UI state: modals, sidebar, notifications, loading, errors.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `modals` | `object` | Named modal flags: `createEntry`, `editEntry`, `createRelation`, `settings`, `confirmDelete`, `entryDetail` |
| `sidebar` | `object` | `{ isOpen, width }` — sidebar visibility and width (default 250px) |
| `notifications` | `array` | Notification items with `id`, `type`, `title`, `message`, `read`, `timestamp`, `duration` |
| `isLoading` | `boolean` | Global loading indicator |
| `loadingText` | `string` | Custom loading message (default: `"Загрузка..."`) |
| `error` | `object \| null` | Current error object |
| `errorModalOpen` | `boolean` | Error modal visibility |

**Computed getters:**

| Getter | Returns |
|---|---|
| `activeModals` | `string[]` — names of currently open modals |
| `hasActiveModal` | `boolean` |
| `unreadNotifications` | `object[]` — filtered unread notifications |
| `modalConfig` | `object` — overlay and content CSS style tokens |

**Actions:**

| Method | Params | Description |
|---|---|---|
| `openModal(modalName)` | `string` | Open a named modal |
| `closeModal(modalName)` | `string` | Close a named modal |
| `closeAllModals()` | — | Close every modal |
| `toggleSidebar()` | — | Toggle sidebar open/close |
| `openSidebar()` | — | Open sidebar |
| `closeSidebar()` | — | Close sidebar |
| `addNotification(notification)` | `object` | Prepend notification, auto-generates `id`/`timestamp`, caps at 50 |
| `markNotificationAsRead(id)` | `number` | Mark single notification read |
| `markAllNotificationsAsRead()` | — | Mark all read |
| `removeNotification(id)` | `number` | Remove single notification |
| `clearNotifications()` | — | Clear all notifications |
| `startLoading(text?)` | `string` | Begin global loading |
| `stopLoading()` | — | End global loading |
| `setError(error)` | `object` | Set error, open error modal, add error notification |
| `clearError()` | — | Clear error and close error modal |
| `showSuccessMessage(message, title?)` | `string, string` | Add success notification (3s duration) |
| `showErrorMessage(message, title?)` | `string, string` | Add error notification (5s duration) |
| `showInfoMessage(message, title?)` | `string, string` | Add info notification (4s duration) |
| `showWarningMessage(message, title?)` | `string, string` | Add warning notification (4s duration) |

---

### 3. EmotionsStore

**File:** `src/store/stores/EmotionsStore.js` (297 lines)

Manages the Berkeley emotion model (27 emotions across positive/negative/neutral categories), user emotion selection for entries, and draft persistence.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `emotionsCatalog` | `array` | 27 emotions from API (or 8 fallbacks) |
| `isLoadingCatalog` | `boolean` | Catalog loading state |
| `catalogError` | `string \| null` | Catalog load error |
| `categories` | `array` | Derived categories: `positive`, `negative`, `neutral` |
| `currentSelection` | `array` | User-selected emotions with intensity (1-100) |

**Computed getters:**

| Getter | Returns |
|---|---|
| `categorizedEmotions` | `object` — emotions grouped by `category.id` |
| `hasSelection` | `boolean` |
| `selectionCount` | `number` |

**Actions:**

| Method | Params | Description |
|---|---|---|
| `loadEmotionsCatalog()` | — | Fetch catalog from API. Falls back to 8 basic emotions on failure |
| `extractCategories()` | — | Derive unique categories from catalog, map to display labels |
| `getEmotionsByCategory(categoryId)` | `string` | Return emotions filtered by category |
| `getEmotionIcon(nameEn)` | `string` | Return icon character for emotion name |
| `addEmotion(categoryId, emotionId, intensity?)` | `string, number, number` | Add to current selection (default intensity 50, clamped 1-100) |
| `updateEmotionIntensity(selectionId, intensity)` | `string, number` | Adjust intensity of selected emotion |
| `removeEmotion(selectionId)` | `string` | Remove emotion from selection |
| `clearSelection()` | — | Clear selection and draft |
| `convertToAPIFormat()` | — | Format selection as `{ emotion_id, intensity (1-10) }[]` |
| `saveToEntry(entryId)` | `number` | Attach current selection to entry via API |
| `saveDraft()` | — | Persist `currentSelection` to `localStorage('emotions_draft')` |
| `loadDraft()` | — | Restore draft if younger than 24h |
| `clearDraft()` | — | Remove draft from localStorage |

**API client:** `EmotionsAPIClient`  
**LocalStorage keys:** `emotions_draft`

---

### 4. TagsStore

**File:** `src/store/stores/TagsStore.js` (76 lines)

User tag CRUD operations.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `tags` | `array` | Tag objects `{ id, user_id, name, created_at }` |
| `isLoading` | `boolean` | Fetch loading state |
| `error` | `string \| null` | Last error message |

**Actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `fetchTags(filters?)` | `object` | `Promise<void>` | GET `/tags` with optional query filters |
| `createTag(tagName)` | `string` | `Promise<object>` | POST `/tags`, push to local tags array |
| `findOrCreateTag(tagName)` | `string` | `Promise<object>` | POST `/tags/find-or-create` — upsert |
| `deleteTag(tagId)` | `number` | `Promise<void>` | DELETE `/tags/:id`, filter from local array |

**API client:** `apiClient` (direct axios wrapper at `../../core/adapters/config`)

### 5. NodeStore

**File:** `src/store/stores/NodeStore.js` (730 lines)

**The largest store.** Handles full CRUD for all six entity types (Dream, Thought, Memory, Plan, Action, Person), each with specialized fields.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `nodes` | `array` | Currently loaded nodes |
| `currentNode` | `object \| null` | Last created/updated/fetched single node |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Last error message |
| `pagination` | `object \| null` | Pagination metadata from API |
| `nodeTypes` | `array` | Available node type definitions |
| `edgeTypes` | `array` | Available edge type definitions |

**Computed getters:**

| Getter | Returns |
|---|---|
| `dreamNodes` | `nodes` filtered by `nodeTypeCode === 'dream'` |
| `thoughtNodes` | `nodes` filtered by `nodeTypeCode === 'thought'` |
| `memoryNodes` | `nodes` filtered by `nodeTypeCode === 'memory'` |
| `planNodes` | `nodes` filtered by `nodeTypeCode === 'plan'` |
| `actionNodes` | `nodes` filtered by `nodeTypeCode === 'action'` |
| `overduePlans` | Plan nodes past `deadline` and not `isCompleted` |

**Generic node actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `fetchNodes(filters?)` | `object` | `Promise<void>` | GET `/graph/nodes`, populate `nodes` + `pagination` |
| `fetchNodeById(id)` | `string` | `Promise<object>` | GET single node, set `currentNode` |
| `createNode(data)` | `object` | `Promise<object>` | POST new node, prepend to `nodes` |
| `updateNode(id, data)` | `string, object` | `Promise<object>` | PUT node, update in `nodes` array + `currentNode` |
| `deleteNode(id)` | `string` | `Promise<void>` | Soft delete (archive), filter from `nodes` |
| `restoreNode(id)` | `string` | `Promise<void>` | Restore soft-deleted node |
| `fetchNodeTypes()` | — | `Promise<void>` | Fetch available node type definitions |
| `fetchEdgeTypes()` | — | `Promise<void>` | Fetch available edge type definitions |

**Specialized entity actions grouped by type:**

*Each entity type has its own `fetch`, `create`, `update`, `delete` methods. Specialized fields are delegated to the corresponding API client methods.*

| Entity | Specialized Fields | Methods |
|---|---|---|
| **Dream** | `lucidity`, `vividness`, `nightmare`, sleep dates | `fetchDreams`, `createDream`, `updateDream`, `deleteDream` |
| **Thought** | `importance`, `confidence` | `fetchThoughts`, `createThought`, `updateThought`, `deleteThought` |
| **Memory** | `eventDate`, `confidence` | `fetchMemories`, `createMemory`, `updateMemory`, `deleteMemory` |
| **Plan** | `deadline`, `priority`, `completion` | `fetchPlans`, `createPlan`, `updatePlan`, `deletePlan` |
| **Action** | `startDate`, `endDate` | `fetchActions`, `createAction`, `updateAction`, `deleteAction` |
| **Person** | `name`, `category`, `relationship`, `bio`, `birthDate` | `fetchPeople`, `createPerson`, `updatePerson`, `deletePerson`, `getMostMentionedPeople`, `getPersonContacts` |

**Cross-entity queries:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `getMostMentionedPeople(limit)` | `number` (default 5) | `Promise` | Most frequently mentioned people |
| `getPersonContacts(id)` | `string` | `Promise` | Contact info for a person |
| `getMostConnected(limit)` | `number` (default 5) | `Promise` | Nodes with most edge connections |

**API clients:** `NodesAPIClient`, `PeopleAPIClient`  
**Mapper:** `NodeMapper.toDomain()`

### 6. EdgeStore

**File:** `src/store/stores/EdgeStore.js` (78 lines)

Manages graph edges (connections between nodes).

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `edges` | `array` | Currently loaded edges |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Last error message |

**Actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `createEdge(data)` | `object` | `Promise<object>` | POST new edge, push to `edges` array |
| `fetchEdgesByNode(nodeId, direction?)` | `string, string` | `Promise<void>` | GET edges for a node. `direction`: `'in'`, `'out'`, `'both'` (default) |
| `deleteEdge(id)` | `string` | `Promise<void>` | DELETE edge, filter from `edges` array |

**API client:** `EdgesAPIClient`  
**Mapper:** `EdgeMapper.toDomain()`

### 7. SelectionStore

**File:** `src/store/stores/SelectionStore.js` (32 lines)

Tracks which node or edge is currently selected in the UI.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `selectedNode` | `object \| null` | Currently selected node |
| `selectedEdge` | `object \| null` | Currently selected edge |

**Actions:**

| Method | Params | Description |
|---|---|---|
| `selectNode(node)` | `object` | Set `selectedNode` |
| `selectEdge(edge)` | `object` | Set `selectedEdge` |
| `clearSelection()` | — | Clear both `selectedNode` and `selectedEdge` |
| `clearNodeSelection()` | — | Clear only `selectedNode` |
| `clearEdgeSelection()` | — | Clear only `selectedEdge` |

### 8. TraversalStore

**File:** `src/store/stores/TraversalStore.js` (70 lines)

Graph traversal and analysis operations.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `graphData` | `object` | `{ nodes: [], edges: [] }` — full graph snapshot |
| `traversalResult` | `object` | `{ path: [], edges: [] }` — last traversal output |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Last error message |

**Actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `loadGraph()` | — | `Promise<void>` | Fetch full graph data (nodes + edges) |
| `traverse(nodeId, params)` | `string, object` | `Promise<void>` | Traverse graph from a starting node |
| `getMostConnected(limit)` | `number` (default 5) | `Promise` | Return most connected nodes |

**API client:** `EdgesAPIClient`  
**Mappers:** `NodeMapper.toDomainArray()`, `EdgeMapper.toDomainArray()`

### 9. AnalyticsStore

**File:** `src/store/stores/AnalyticsStore.js` (181 lines)

Read-only analytics queries: user profile stats, charts, heatmaps, streaks.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `profile` | `object \| null` | User analytics profile |
| `stats` | `object \| null` | Aggregate statistics |
| `entriesByMonth` | `object \| null` | Monthly entry counts |
| `emotionDistribution` | `object \| null` | Emotion distribution breakdown |
| `emotionTimeline` | `object \| null` | Emotion data over time |
| `activityHeatmap` | `object \| null` | Day-level activity heatmap |
| `streaks` | `object \| null` | Current/longest streak information |
| `nodeConnections` | `object \| null` | Most connected nodes |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Last error message |

**Actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `fetchProfile()` | — | `Promise<void>` | Set `profile` |
| `fetchStats()` | — | `Promise<void>` | Set `stats` |
| `fetchEntriesByMonth(months?)` | `number` (default 12) | `Promise<void>` | Set `entriesByMonth` |
| `fetchEmotionDistribution()` | — | `Promise<void>` | Set `emotionDistribution` |
| `fetchEmotionTimeline(granularity?)` | `string` (default `'day'`) | `Promise<void>` | Set `emotionTimeline` |
| `fetchActivityHeatmap(year)` | `number` | `Promise<void>` | Set `activityHeatmap` for given year |
| `fetchStreaks()` | — | `Promise<void>` | Set `streaks` |
| `fetchNodeConnections(limit?)` | `number` (default 10) | `Promise<void>` | Set `nodeConnections` |

**API client:** `AnalyticsAPIClient`

### 10. AIStore

**File:** `src/store/stores/AISTore.js` (122 lines)

AI-powered analysis and image generation with in-memory caching.

**State (observable):**

| Property | Type | Description |
|---|---|---|
| `analysisCache` | `object` | `{ [nodeId]: AIAnalysis[] }` — per-node analysis results |
| `imageCache` | `object` | `{ [nodeId]: AIImage[] }` — per-node generated images |
| `loading` | `object` | `{ [analysis_\|image_${nodeId}]: boolean }` — per-key loading flags |
| `error` | `string \| null` | Last error message |

**Analysis actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `requestAnalysis(nodeId, data)` | `string, object` | `Promise<AIAnalysis[]>` | Request AI analysis, append to cache |
| `getAnalysis(nodeId)` | `string` | `Promise<AIAnalysis[]>` | Return cached analysis or fetch from API |

**Image actions:**

| Method | Params | Returns | Description |
|---|---|---|---|
| `requestImage(nodeId, data)` | `string, object` | `Promise<AIImage[]>` | Request AI image generation, append to cache |
| `getImages(nodeId)` | `string` | `Promise<AIImage[]>` | Return cached images or fetch from API |

**Cache management:**

| Method | Params | Description |
|---|---|---|
| `clearCache(nodeId?)` | `string` or `undefined` | If `nodeId` given: clear that node's analysis + image cache and loading flags. If omitted: clear all caches |

**API client:** `AIAPIClient`  
**Entity classes:** `AIAnalysis`, `AIImage`

---

## Data Flow

```
Component
   │  useXStore() → sub-store instance (from singleton RootStore)
   ▼
Sub-store action (async)
   │  1. Set isLoading = true
   │  2. Call API client
   │  3. runInAction() → map response via Mapper, update observables
   │  4. Set isLoading = false
   ▼
React re-renders (via observer or mobx-react-lite)
```

### Key MobX Patterns Used

1. **`makeAutoObservable(this)`** — Each store class calls this in its constructor to make all properties reactive.
2. **`runInAction(() => { ... })`** — Used inside async methods to update observables after `await`.
3. **`toJS()`** — Used in `EmotionsStore.saveDraft()` to strip MobX reactivity before localStorage serialization.
4. **Computed getters** — Used for derived state (`isAuthenticated`, `activeModals`, `dreamNodes`, etc.).

---

## File Map

```
src/store/
├── index.js                  ← barrel exports
├── RootStore.js              ← composition root (29 lines)
├── StoreContext.jsx           ← singleton + context + hooks (43 lines)
└── stores/
    ├── AuthStore.js           ← 162 lines
    ├── EmotionsStore.js       ← 297 lines
    ├── TagsStore.js           ← 76 lines
    ├── UIStore.js             ← 187 lines
    ├── NodeStore.js            ← 730 lines
    ├── EdgeStore.js             ← 78 lines
    ├── SelectionStore.js        ← 32 lines
    ├── TraversalStore.js        ← 70 lines
    ├── AnalyticsStore.js        ← 181 lines
    └── AISTore.js               ← 122 lines
```

**Total:** ~2,057 lines of store code across 11 files.