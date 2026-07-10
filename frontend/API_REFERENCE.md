# Frontend API Reference — Mapping to Backend V3

> Base URL: `VITE_API_URL` default `http://localhost:3003/api/v1`
>
> All responses: `{ success: boolean, data: any, error?: string }`
> Axios interceptor auto-unwraps `response.data`

---

## Auth

| Method | Backend Endpoint | Frontend Client |
|--------|-----------------|-----------------|
| POST | `/auth/login` | `AuthAPIClient.login()` |
| POST | `/auth/register` | `AuthAPIClient.register()` |
| POST | `/auth/recover` | `AuthAPIClient.recover()` |
| GET | `/auth/verify` | `AuthStore.fetchCurrentUser()` |

**OLD (removed):**
- `AuthAPIClient.checkPasswordStrength()` — NOT in backend V3
- `AuthAPIClient.generatePassword()` — NOT in backend V3

**ACTION:** Remove `checkPasswordStrength`, `generatePassword` from AuthAPIClient, remove from AuthStore

---

## Graph Core

### Nodes

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/graph/nodes` `?page, limit, node_type_code, search, from_date, to_date` | NodesAPIClient.getAll() | NodeStore
| GET | `/graph/nodes/:id` | 🆕 NodesAPIClient.getById() | NodeStore
| POST | `/graph/nodes` | 🆕 NodesAPIClient.create() | NodeStore
| PUT | `/graph/nodes/:id` | 🆕 NodesAPIClient.update() | NodeStore
| DELETE | `/graph/nodes/:id` | 🆕 NodesAPIClient.delete() | NodeStore
| POST | `/graph/nodes/:id/restore` | 🆕 NodesAPIClient.restore() | NodeStore
| GET | `/graph/node-types` | 🆕 NodesAPIClient.getNodeTypes() |
| GET | `/graph/edge-types` | NodesAPIClient.getEdgeTypes() |

### Edges

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| POST | `/graph/edges` | 🆕 EdgesAPIClient.create() | EdgeStore
| GET | `/graph/edges/node/:nodeId` `?direction: outgoing|incoming|both` | 🆕 EdgesAPIClient.getByNode() | EdgeStore
| GET | `/graph/most-connected` `?limit` | 🆕 EdgesAPIClient.getMostConnected() | TraversalStore

### Traversal

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/graph/traversal/:nodeId` ?direction: forward|backward|both, depth, filterNodeType, filterEdgeType, minConfidence | 🆕 EdgesAPIClient.getTraversal() | TraversalStore
| GET | `/graph/graph-data` | 🆕 EdgesAPIClient.getGraphData() | TraversalStore

**OLD (delete):**
- `RelationsAPIClient` — `/relations/*` — NOT in backend V3
- `RelationsStore` — all via Edges via EdgeStore

---

## Specialized Node Types

### Dreams

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/dreams` `?page, limit, from, to, nightmare` | NodsAPIClient.getAll() |
| GET | `/dreams/:id` | 🆕 NodesAPIClient.getById() |
| POST | `/dreams` | 🆕 NodesAPIClient.create() |
| PUT | `/dreams/:id` | 🆕 NodesAPIClient.update() |
| DELETE | `/dreams/:id` | 🆕 NodesAPIClient.delete() |

### Thoughts

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/thoughts` `?page, limit, from_date, to_date, search` |
| GET | `/thoughts/:id` |
| POST | `/thoughts` |
| PUT | `/thoughts/:id` |
| DELETE | `/thoughts/:id` |

### Memories

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/memories` `?page, limit, from_date, to_date, search` |
| GET | `/memories/:id` |
| POST | `/memories` |
| PUT | `/memories/:id` |
| DELETE | `/memories/:id` |

### Plans

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/plans` `?page, limit, completed, overdue, from_date, to_date, search` |
| GET | `/plans/:id` |
| POST | `/plans` |
| PUT | `/plans/:id` |
| DELETE | `/plans/:id` |

### Actions

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/actions` `?page, limit, from_date, to_date, search` |
| GET | `/actions/:id` |
| POST | `/actions` |
| PUT | `/actions/:id` |
| DELETE | `/actions/:id` |

### People

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/people` `?page, limit, search, relationship` | 🆕 PeopleAPIClient.getAll() | NodeStore
| GET | `/people/most-mentioned` `?limit` | 🆕 PeopleAPIClient.getMostMentioned() |
| GET | `/people/:id` | 🆕 PeopleAPIClient.getById() |
| GET | `/people/:id/contacts` | 🆕 PeopleAPIClient.getContacts() |
| POST | `/people` | 🆕 PeopleAPIClient.create() |
| PUT | `/people/:id` | 🆕 PeopleAPIClient.update() |
| DELETE | `/people/:id` | 🆕 PeopleAPIClient.delete() |

**OLD (delete):**
- `BodyStatesAPIClient` — `/body-states/*` — NOT in backend V3
- `CircumstancesAPIClient` — `/circumstances/*` — NOT in backend V3
- `BodyStatesStore` — NOT in backend V3
- `CircumstancesStore` — NOT in backend V3
- `SkillsAPIClient` — `/skills/*` — NOT in backend V3
- `SkillProgressStore` — NOT in backend V3
- `CircumstancesStore` — NOT in backend V3

**ACTION:** Remove API clients, remove Store. Create `PeopleAPIClient`.

---

## Emotions

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/emotions` | EmotionsAPIClient.getAll() | ✅ EmotionsStore
| GET | `/emotions/category/:category` | EmotionsAPIClient.getByCategory() |
| PUT | `/emotions/node/:nodeId` | 🔄 EmotionsAPIClient.replaceNodeEmotions() | EmotionsStore
| GET | `/emotions/stats` | EmotionsAPIClient.getStats() |
| GET | `/emotions/most-frequent` `?limit` | EmotionsAPIClient.getMostFrequent() |
| GET | `/emotions/timeline` `?granularity: day/week/month` | 🆕 EmotionsAPIClient.getTimeline() |
| GET | `/think` Endpoint not in backend V3 — DELETE |

**OLD remove EmotionsAPIClient.attachToEntry() -> `/emotions/entry/:id` → PUT → `/emotions/node/:nodeId`
- `EmotionsAPIClient.getEntryEmotions()` → DELETE (not in API)
- `EmotionsAPIClient.deleteEntryEmotions()` → DELETE (not in API)

**ACTION:** Rename `attachToEntry` → `replaceNodeEmotions`, change method PUT from POST.
Delete `getEntryEmotions`, `deleteEntryEmotions`.
Add `getTimeline`.

---

## Tags

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/tags` | 💻 TagsAPIClient.getAll() | TagsStore
| GET | `/tags most-used` `?limit` | 🆕 TagsAPIClient.getMostUsed() |
| GET | `/tags/unused` | 🆕 TagsAPIClient.getUnused() |
| GET | `/tags/:id` | TagsAPIClient.getById() |
| GET | `/tags/:id/nodes` | 🆕 TagsAPIClient.getNodes() |
| POST | `/tags` | TagsAPIClient.create() |
| POST | `/tags/find-or-create` | 🆕 TagsAPIClient.findOrCreate() |
| PUT | `/tags/:id/name` | 💻 TagsAPIClient.updateName() |
| DELETE | `/tags/:id` | TagsAPIClient.delete() |
| GET | `/tags/node/:nodeId` | 💻 TagsAPIClient.getByNode() |
| PUT | `/tags/node/:nodeId` | TagsAPIClient.setNodeTags() |

**OLD (delete):**
- `TagsAPIClient.update()` — `/tags/:id` — Backend uses `/tags/:id/name`
- `TagsAPIClient.setNodeTags()` — OLD `/tags/node/:id` → DELETE (replace TagsAPIClient.update() → PUT `/tags/:id/name`

**ACTION:** Fix TagsAPIClient.endpoints to match V3 API.

---

## Measurements

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| POST | `/measurements/node/:nodeId` | 🆕 MeasurementsAPIClient.create() | NodeStore
| GET | `/measurements/node/:nodeId` | 🆕 MeasurementsAPIClient.getByNode() | NodeStore
| DELETE | `/measurements/node/:nodeId` | 🆕 MeasurementsAPIClient.deleteByNode() | NodeStore

**ACTION:** Create `MeasurementsAPIClient`.

---

## Analytics

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| GET | `/analytics/profile` | 🆕 AnalyticsAPIClient.getProfile() | AnalyticsStore
| GET | `/analytics/stats` | 💻 AnalyticsAPIClient.getStats() |
| GET | `/analytics/entries-by-month` `?months` | AnalyticsAPIClient.getEntriesByMonth() |
| GET | `/analytics/emotion-distribution` | AnalyticsAPIClient.getEmotionDistribution() |
| GET | `/analytics/emotion-timeline` `?granularity: day/week/month` | 🆕 AnalyticsAPIClient.getEmotionTimeline() |
| GET | `/analytics/activity-heatmap` `?year` | AnalyticsAPIClient.getActivityHeatmap() |
| GET | `/analytics/streaks` | AnalyticsAPIClient.getStreaks() |
| GET | `/analytics/node-connections` `?limit` | 🆕 AnalyticsAPIClient.getNodeConnections() |

**OLD (delete):**
- `BodyStatesAPIClient.getStats/Streaks
- `CircumstancesAPIClient.getStats/gHeatma (not in V3
- `BalyticsAPIClient` does NOT have `activity-heatmap` — backend DOES have it
- `AnalyticsAPIClient` does NOT have `profile`, `node-connections`, `emotion-timeline` — backend DOES have these

**ACTION:** Create `AnalyticsStore` (new). Update `AnalyticsAPIClient` with V3 endpoints.

---

## AI

| Method | Backend Endpoint | Frontend Client | Store |
|--------|-----------------|-----------------|-------|
| POST | `/ai/analysis/:nodeId` | 🆕 AIAPIClient.requestAnalysis() | AIStore
| GET | `/ai/analysis/:nodeId` | 🆕 AIAPIClient.getAnalysis() | AIStore
| POST | `/ai/image/:nodeId` | 🆕 AIAPIClient.requestImage() | AIStore
| GET | `/ai/image/:nodeId` | 🆕 AIAPIClient.getImages() | AIStore

**ACTION:** Create `AIAPIClient`, `AIStore`.

---

## Data Mapping (Critical!)

### Old Endpoint → New Endpoint

| Old Frontend | New Backend |
|-------------|-------------|
| GET /entries | GET `/graph/nodes` |
| POST /entries | POST `/graph/nodes` |
| PUT /entries/:id | PUT `/graph/nodes/:id` |
| DELETE /entries/:id | DELETE `/graph/nodes/:id` |
| GET /entries/search | GET `/graph/nodes?search=` |
| GET /entries/:id/emotions | GET (via dreams/thoughts/etc. specialized endpoint) |
| GET /entries/:id/tags | GET `/tags/node/:nodeId` |
| POST /entries/:id/tags | PUT `/tags/node/:nodeId` |
| GET /entries/:id/people | GET `/people` |
| POST /entries/:id/people | POST `/graph/edges` (edge type: mentions) |
| GET /relations | GET `/graph/edges/node/:nodeId` |
| GET /relations/types | GET `/graph/edge-types` |
| GET /relations/most-connected | GET `/graph/most-connected` |
| POST /relations | POST `/graph/edges` |
| GET /body-states | NOT IN V3 (use Measurements) |
| POST /body-states | NOT IN V3 |
| GET /circumstances | NOT IN V3 (use Place nodes) |
| GET /skills | NOT IN V3 (Characteristics are computed) |
| GET /skills/:id/progress | NOT IN V3 |
| POST /skills | NOT IN V3 |

### Response Structure Differences

| Endpoint | Old Response | New Response |
|----------|-------------|-------------|
| List | `{ entries: [...], pagination: {...} }` | `{ data: { data: [...], pagination: {...} } }` |
| Single Entry | `{ id, entry_type, content, ... }` | `{ node: {...}, dream/thought/etc: {...} }` |
| Emotions | `{ id, code, intensity }` via emotions | SAME, but via emotions catalog |
| Tags | `{ id, name }` | SAME |

### Authentication Response

| Old | New |
|-----|-----|
| `{ user: {...}, token: "..." }` | `{ success: true, data: { token: "...", expires_in: "7d" } }` |

---

## Error Codes (Backend V3)

| Status | Meaning |
|--------|----------|
| 400 | Validation error |
| 401 | Unauthorized / expired token |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server |

**Frontend adaptation:** Axios interceptor already handles 401 (clears tokens). Need to handle 429 (rate limit) and 409.

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 10 | 15 min |
| Register / Recover | 3 | 1 hour |
| API (general) | 100 | 15 min |
| Search | 30 | 1 min |
| AI | 5 | 1 min |

**Frontend adaptation:** Need rate limit feedback to user. UIStore should handle 429 errors.