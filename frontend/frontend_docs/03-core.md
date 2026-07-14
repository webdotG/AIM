# 03 -- Core Module

> The data layer between UI and backend API. Follows the **Repository + Mapper** pattern
> with two parallel versions: **V2** (entry-based adapters) and **V3** (graph-based entities/mappers).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Entities V2](#entities-v2)
4. [Entities V3](#entities-v3)
5. [API Configuration](#api-configuration)
6. [Mappers V2](#mappers-v2)
7. [Mappers V3](#mappers-v3)
8. [API Clients V2](#api-clients-v2)
9. [API Clients V3](#api-clients-v3)
10. [Repositories](#repositories)
11. [Data Flow](#data-flow)
12. [Entity Relationships](#entity-relationships)
13. [Missing Client Files](#missing-client-files)

---

## Architecture Overview

```text
+---------------------------------------------------------------+
|                           UI Layer                            |
|              (views, components, hooks, services)             |
+---------------------------------------------------------------+
                                 |
             +-------------------+-------------------+
             |                   |                   |
             v                   v                   v
+----------------------+ +--------------------+ +----------------------+
|   Repositories (V2) | | Repositories (V3)  | |  Direct Client Use   |
|  (abstract stubs)   | | (mostly V2 reuse)  | | (V3 adapter clients) |
+----------+----------+ +----------+---------+ +----------+-----------+
           |                       |                       |
           v                       v                       v
+----------------------+ +--------------------+ +----------------------+
|  Mappers V2         | |  Mappers V3        | |  (no mappers yet)    |
|  snake/Camel        | |  DTO -> Domain obj | |                      |
+----------+----------+ +----------+---------+ +----------+-----------+
           |                       |                       |
           v                       v                       v
+----------------------+ +--------------------+ +----------------------+
|  API Clients V2     | |  API Clients V3    | |  API Clients V3      |
|  (adapters/api/)    | |  (adaptersV3/)     | |  graph-focused       |
+----------+----------+ +----------+---------+ +----------+-----------+
           |                       |                       |
           v                       v                       v
+---------------------------------------------------------------+
|                       apiClient (axios)                       |
|       baseURL: VITE_API_URL or localhost:3003/api/v1          |
|       Bearer auth, auto 401 redirect, response unwrap         |
+---------------------------------------------------------------+
                                 |
                                 v
                    +----------------------+
                    |   Backend REST API   |
                    +----------------------+
```

**Two Parallel Tracks:**

| Layer | V2 (Entry model) | V3 (Graph model) |
|---|---|---|
| **Entities** | `User`, `Person`, `Tag`, `Emotion`, `Analytics` | `Node`, `Edge`, `AIAnalysis`, `AIImage` |
| **Mappers** | `UserMapper`, `EntryMapper`, `BodyStateMapper`, etc. | `NodeMapper`, `EdgeMapper` |
| **API Clients** | `AuthAPIClient`, `PeopleAPIClient`, `TagsAPIClient`, etc. | `NodesAPIClient`, `EdgesAPIClient`, `AIAPIClient`, etc. |
| **Entity format** | Plain objects (mapper returns `{}`) | Class instances (mapper returns `new Node()`) |

---

## Directory Structure

```text
src/core/
  adapters/
    config.js                          # Axios apiClient setup + interceptors
    api/
      clients/
        index.js                   # Barrel export (12 listed, 5 missing files)
        AuthAPIClient.js           # Extends AuthRepository, uses UserMapper
        PeopleAPIClient.js         # CRUD for /people
        TagsAPIClient.js           # CRUD for /tags
        EmotionsAPIClient.js       # /emotions entry mgmt + stats
        AnalyticsAPIClient.js      # /analytics aggregation endpoints
        EntriesAPIClient.js        # MISSING - test exists
        BodyStatesAPIClient.js     # MISSING - test exists
        CircumstancesAPIClient.js  # MISSING - test exists
        SkillsAPIClient.js         # MISSING - test exists
        RelationsAPIClient.js      # MISSING - test exists
        __tests__/                 # Tests for 10 clients
      mappers/
        index.js                   # Barrel export (5 mappers)
        UserMapper.js
        EntryMapper.js
        BodyStateMapper.js
        CircumstanceMapper.js
        SkillMapper.js
        __tests__/                 # Tests for all 5 mappers
  adaptersV3/
    api/
      index.js                       # Barrel export (8 clients)
      NodesAPIClient.js              # /graph/nodes + type-specific CRUD
      EdgesAPIClient.js              # /graph/edges + traversal
      MeasurementsAPIClient.js       # /measurements/node/:id
      AIAPIClient.js                 # /ai/analysis, /ai/image
      PeopleAPIClient.js             # /people V3 API
      TagsAPIClient.js               # /tags V3 API
      EmotionsAPIClient.js           # /emotions V3 API
      AnalyticsAPIClient.js          # /analytics V3 API
  entities/
    index.js                           # Re-exports V3 entities (broken refs)
    User.js
    Person.js
    Tag.js
    Emotion.js
    Analytics.js
  entitiesV3/
    Node.js                            # Graph node (15 types)
    Edge.js                            # Graph edge (16 types)
    AIAnalysis.js                      # AI analysis results
    AIImage.js                         # AI-generated images
  mappersV3/
    index.js                           # Barrel export
    NodeMapper.js                      # DTO -> Node instance
    EdgeMapper.js                      # DTO -> Edge instance
  repositories/
    index.js                           # Barrel export (11 repos)
    base/
      BaseRepository.js              # Abstract base CRUD
    AuthRepository.js
    EntriesRepository.js               # Partial impl
    EmotionsRepository.js
    RelationsRepository.js             # Does NOT extend BaseRepository
    TagsRepository.js
    PeopleRepository.js
    BodyStatesRepository.js
    CircumstancesRepository.js
    SkillsRepository.js
    AnalyticsRepository.js
  constants/
    entries.js                         # ENTRY_TYPES, icons, limits
```

---

## Entities V2

Plain JS classes for the legacy entry-based model. Used with V2 mappers that return plain objects.

### User

**File:** `entities/User.js`

Simple user model with login tracking. No methods.

```
User
  id: any
  login: string
  createdAt: Date
  lastLogin: Date | null
```

### Person

**File:** `entities/Person.js`

Represents a person associated with entries (dreams, thoughts, etc.).

```
Person
  id: any
  userId: any
  name: string
  category: "family" | "friends" | "acquaintances" | "strangers"
  relationship: string
  bio: string
  birthDate: Date | null
  notes: string
  mentionCount: number (default 0, from JOIN with entry_people)
  createdAt: Date
  --
  isFamily() -> boolean
  isFriend() -> boolean
  getCategoryIcon() -> emoji
    family: 👨‍👩‍👧‍👦, friends: 👥, acquaintances: 🤝, strangers: 👤
  isFrequentlyMentioned() -> boolean (mentionCount > 5)
```

### Tag

**File:** `entities/Tag.js`

```
Tag
  id: any
  userId: any
  name: string
  usageCount: number (default 0, from JOIN with entry_tags)
  createdAt: Date
  --
  isPopular() -> boolean (usageCount > 10)
  isUnused() -> boolean (usageCount === 0)
```

### Emotion

**File:** `entities/Emotion.js`

```
Emotion
  id: any
  nameEn: string
  nameRu: string
  category: "positive" | "negative" | "neutral"
  description: string
  parentEmotionId: any
  --
  isPositive() -> boolean
  isNegative() -> boolean
  isNeutral() -> boolean
  getCategoryIcon() -> emoji
    positive: 😊, negative: 😔, neutral: 😐
  static createWithIntensity(emotion, intensity) -> object
    clamps intensity to [1, 10]
```

### Analytics

**File:** `entities/Analytics.js`

Aggregated statistics for entry types.

```
Analytics
  dreams: number
  memories: number
  thoughts: number
  plans: number
  completedPlans: number
  overduePlans: number
  totalEntries: number
  --
  getTotalByType(type) -> number
  getCompletionRate() -> number
    completedPlans / plans * 100, returns 0 if plans === 0
  getMostActiveType() -> string
    type key with highest count
```

### entities/index.js -- Issue

**File:** `entities/index.js`

The V2 index re-exports from V3 entity paths:

```js
export { Node, NODE_TYPES, NODE_TYPE_ICONS, NODE_TYPE_LABELS } from './Node';
export { Edge, EDGE_TYPES } from './Edge';
export { AIAnalysis } from './AIAnalysis';
export { AIImage } from './AIImage';
```

These `from './Node'` references look for files in `entities/`, but `Node.js`, `Edge.js`,
`AIAnalysis.js`, and `AIImage.js` exist **only** in `entitiesV3/`. **Broken barrel export.**
The V2 entities (`User`, `Person`, `Tag`, `Emotion`, `Analytics`) are **not exported** from this index.

---

## Entities V3

Class-based entities aligned with the backend graph model. Each constructor handles both
`snake_case` (backend DTO) and `camelCase` input.

### Node

**File:** `entitiesV3/Node.js`

The central entity of the graph model.

**Static constants:**

| Constant | Description |
|---|---|
| `NODE_TYPES` | 15 types: `dream, thought, memory, plan, action, person, place, book, project, conversation, movie, course, website, music, article` |
| `TYPE_ICONS` | 15 emoji mappings (dream: 💭, thought: 💡, memory: 📷, plan: 📋, etc.) |
| `TYPE_LABELS` | 15 Russian labels (dream: Сон, thought: Мысль, memory: Воспоминание, etc.) |

Re-exported as `export const` at module bottom.

**Instance:**

```
Node
  id: any
  userId: any (accepts snake_case: user_id)
  nodeTypeCode: string (accepts: node_type_code)
  title: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  measurement: array (default [])
  edges: array (default [])
  emotions: array (default [])
  tags: array (default [])
  analysis: array (default [])
  images: array (default [])
  --
  isDream/isThought/isMemory/isPlan/isAction/isPerson/isPlace() -> boolean
  isArchived() -> boolean (deletedAt truthy)
  isEditable() -> boolean (!isArchived)
  displayTitle() -> string (title or "Node (typeCode)")
  hasEmotion() -> boolean
  icon() -> string emoji
  label() -> string (Russian label)
  getDominantEmotion() -> object | null (highest intensity emotion)
  getAverageEmotionIntensity() -> number (average of intensities, 0 if empty)
```

### Edge

**File:** `entitiesV3/Edge.js`

Directed relationship between two nodes. 16 edge types.

**Static:** `EDGE_TYPES`: `mentions, caused, resulted_in, inspired, reminded_of, about,
contains, performed_with, completed_by, created, references, symbolizes, contradicts,
depends_on, belongs_to, related_to`

Re-exported as `export const EDGE_TYPES`.

**Instance:**

```
Edge
  id: any
  fromNodeId: any (accepts: from_node_id)
  toNodeId: any (accepts: to_node_id)
  edgeTypeCode: string (accepts: edge_type_code)
  confidence: number
  weight: number
  createdAt: Date
  notes: string
  --
  getEdgeTypeLabel() -> string (Russian label)
    16 labels: Упоминает, Причина, Привело к, Вдохновило, Напомнило, О,
    Содержит, Выполнено с, Завершено, Создало, Ссылается на, Символизирует,
    Противоречит, Зависит от, Надлежит, Связано с
```

### AIAnalysis

**File:** `entitiesV3/AIAnalysis.js`

AI-generated analysis results. Data holder, no methods.

```
AIAnalysis
  id: any
  nodeId: any (accepts: node_id)
  analysisType: string (accepts: analysis_type)
  result: any
  aiModel: string (accepts: ai_model)
  prompt: string
  metadata: any
  createdAt: Date
```

### AIImage

**File:** `entitiesV3/AIImage.js`

AI-generated images. Data holder, no methods.

```
AIImage
  id: any
  nodeId: any (accepts: node_id)
  imageUrl: string (accepts: image_url)
  prompt: string
  metadata: any
  aiModel: string (accepts: ai_model)
  createdAt: Date
```

---

## API Configuration

**File:** `adapters/config.js`

Single shared axios instance for all V2 and V3 API clients.

```js
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Request interceptor:**
- Reads `auth_token` from `localStorage`
- Attaches `Authorization: Bearer <token>` when token exists

**Response interceptor:**
- **Success:** unwraps `response.data` -- client receives plain data, not full response
- **401:** clears `auth_token`, `user_id`, `user` from `localStorage`; redirects to `/auth` after 100ms
- **Error:** normalizes to `{ message, status, data }` structure

---

## Mappers V2

Static mapper classes converting between `snake_case` (backend DTO) and `camelCase` (frontend domain).
Return **plain objects**, not class instances.

### Common Interface

| Method | Direction | Description |
|---|---|---|
| `toDomain(dto)` | backend to frontend | Single DTO to domain object |
| `toDTO(domain)` | frontend to backend | Single domain object to DTO |
| `toDomainArray(dtos)` | backend to frontend | Array of DTOs |

### UserMapper

**File:** `adapters/api/mappers/UserMapper.js`

| DTO (snake_case) | Domain (camelCase) |
|---|---|
| `id` | `id` |
| `email` | `email` |
| `username` | `username` |
| `first_name` | `firstName` |
| `last_name` | `lastName` |
| `avatar` | `avatar` |
| `settings` | `settings` (default `{}`) |
| `created_at` | `createdAt` (Date) |
| `updated_at` | `updatedAt` (Date) |

### EntryMapper

**File:** `adapters/api/mappers/EntryMapper.js`

| DTO | Domain | Notes |
|---|---|---|
| `id` | `id` | |
| `user_id` | `userId` | |
| `entry_type` | `type` | |
| `content` | `content` | |
| `emotions` | `emotions` (default `[]`) | |
| `people` | `people` (default `[]`) | |
| `tags` | `tags` (default `[]`) | |
| `relations` | `relations` (default `{}`) | |
| `is_completed` | `isCompleted` (default `false`) | |
| `deadline` | `deadline` (Date) | |
| `circumstance_id` | `circumstanceId` | |
| `body_state_id` | `bodyStateId` | |
| `created_at` | `createdAt` (Date) | |
| `updated_at` | `updatedAt` (Date) | |

### BodyStateMapper

**File:** `adapters/api/mappers/BodyStateMapper.js`

| DTO | Domain | Notes |
|---|---|---|
| `id` | `id` | |
| `user_id` | `userId` | |
| `timestamp` | `timestamp` (Date) | |
| `location_point` | `locationPoint` | GPS coords |
| `location_name` | `locationName` | Human-readable |
| `location_address` | `locationAddress` | |
| `location_precision` | `locationPrecision` | |
| `health_points` | `healthPoints` | 0-100 |
| `energy_points` | `energyPoints` | 0-100 |
| `circumstance_id` | `circumstanceId` | |
| `created_at` | `createdAt` (Date) | |

### CircumstanceMapper

**File:** `adapters/api/mappers/CircumstanceMapper.js`

| DTO | Domain | Notes |
|---|---|---|
| `id` | `id` | |
| `user_id` | `userId` | |
| `timestamp` | `timestamp` (Date) | |
| `weather` | `weather` | |
| `temperature` | `temperature` | Celsius |
| `moon_phase` | `moonPhase` | |
| `global_event` | `globalEvent` | |
| `notes` | `notes` | |
| `created_at` | `createdAt` (Date) | |

### SkillMapper

**File:** `adapters/api/mappers/SkillMapper.js`

| DTO | Domain | Notes |
|---|---|---|
| `id` | `id` | |
| `user_id` | `userId` | |
| `name` | `name` | |
| `description` | `description` | |
| `category` | `category` | |
| `target_level` | `targetLevel` | |
| `current_level` | `currentLevel` | |
| `progress` | `progress` (default `[]`) | |
| `is_active` | `isActive` | |
| `created_at` | `createdAt` (Date) | |
| `updated_at` | `updatedAt` (Date) | |

---

## Mappers V3

Create **class instances** rather than plain objects. Entities handle dual `snake_case`/`camelCase` themselves.

### NodeMapper

**File:** `mappersV3/NodeMapper.js`

| Method | Return | Description |
|---|---|---|
| `toDomain(dto)` | `Node | null` | Creates `new Node(dto)` |
| `toDomainArray(dtos)` | `Node[]` | Maps array, guards non-array |
| `toDTO(node)` | Plain object | Converts to snake_case for API |

`toDTO` converts: `user_id`, `node_type_code`, `created_at`, `updated_at`, `deleted_at`.
Collections (`emotions`, `tags`, `measurement`, `edges`, `analysis`, `images`) pass through as-is.

### EdgeMapper

**File:** `mappersV3/EdgeMapper.js`

| Method | Return | Description |
|---|---|---|
| `toDomain(dto)` | `Edge | null` | Creates `new Edge(dto)` |
| `toDomainArray(dtos)` | `Edge[]` | Maps array, guards non-array |

No `toDTO` -- Edge entities not yet serialized back through this mapper.

---

## API Clients V2

Located in `adapters/api/clients/`. Thin wrappers around `apiClient`.

### AuthAPIClient

**File:** `adapters/api/clients/AuthAPIClient.js`

Extends `AuthRepository`. Only client with repository inheritance.

| Method | Endpoint | Return | Notes |
|---|---|---|---|
| `login(creds)` | `POST /auth/login` | `{ user, token }` | Uses `UserMapper.toDomain()` |
| `register(data)` | `POST /auth/register` | `{ user, token, backupCode }` | Uses `UserMapper.toDomain()` |
| `recover(code, pass, cap)` | `POST /auth/recover` | `{ token, backupCode, message }` | |
| `checkPasswordStrength(pw)` | `POST /auth/check-password-strength` | `{ isStrong, score, reasons }` | |
| `generatePasswordRecommendation()` | `GET /auth/generate-password` | `string` | |
| `prepareCaptchaData(token)` | -- | Object | Dev: bypass token |

**Dev mode:** When `NODE_ENV === "development"`, hCaptcha replaced with `dev-mode-bypass-token`.

### PeopleAPIClient (V2)

**File:** `adapters/api/clients/PeopleAPIClient.js`

| Method | Endpoint |
|---|---|
| `getAll(filters)` | `GET /people` |
| `getById(id)` | `GET /people/:id` |
| `create(personData)` | `POST /people` |
| `update(id, personData)` | `PUT /people/:id` |
| `delete(id)` | `DELETE /people/:id` |

### TagsAPIClient (V2)

**File:** `adapters/api/clients/TagsAPIClient.js`

| Method | Endpoint |
|---|---|
| `getAll()` | `GET /tags` |
| `getById(id)` | `GET /tags/:id` |
| `create(tagData)` | `POST /tags` |
| `update(id, tagData)` | `PUT /tags/:id` |
| `delete(id)` | `DELETE /tags/:id` |

### EmotionsAPIClient (V2)

**File:** `adapters/api/clients/EmotionsAPIClient.js`

| Method | Endpoint | Description |
|---|---|---|
| `getAll()` | `GET /emotions` | Full catalog |
| `getByCategory(cat)` | `GET /emotions/category/:cat` | By category |
| `attachToEntry(entryId, emotions)` | `POST /emotions/entry/:entryId` | Attach |
| `getEntryEmotions(entryId)` | `GET /emotions/entry/:entryId` | Fetch |
| `deleteEntryEmotions(entryId)` | `DELETE /emotions/entry/:entryId` | Remove |
| `getStats()` | `GET /emotions/stats` | Aggregated |
| `getMostFrequent(limit=10)` | `GET /emotions/most-frequent` | Top N |

### AnalyticsAPIClient (V2)

**File:** `adapters/api/clients/AnalyticsAPIClient.js`

| Method | Endpoint | Description |
|---|---|---|
| `getStats()` | `GET /analytics/stats` | Overall stats |
| `getEntriesByMonth(months=12)` | `GET /analytics/entries-by-month` | Monthly breakdown |
| `getEmotionDistribution()` | `GET /analytics/emotion-distribution` | Pie chart data |
| `getActivityHeatmap(year)` | `GET /analytics/activity-heatmap` | GitHub-style heatmap |
| `getStreaks()` | `GET /analytics/streaks` | Entry streak data |

---

## API Clients V3

Located in `adaptersV3/api/`. Graph-oriented clients for the backend graph model.

### NodesAPIClient

**File:** `adaptersV3/api/NodesAPIClient.js`

Largest client (180 lines). Generic `/graph/nodes` CRUD plus per-type endpoints for each
of the 6 primary entry types plus people.

| Category | Methods | Endpoints |
|---|---|---|
| Generic CRUD | `getAll`, `getById`, `create`, `update`, `delete` | `/graph/nodes` |
| Restore | `restore(id)` | `POST /graph/nodes/:id/restore` |
| Metadata | `getNodeTypes()`, `getEdgeTypes()` | `/graph/node-types`, `/graph/edge-types` |
| Dreams | `fetchDreams`, `createDream`, `updateDream`, `deleteDream` | `/dreams` |
| Thoughts | `fetchThoughts`, `createThought`, `updateThought`, `deleteThought` | `/thoughts` |
| Memories | `fetchMemories`, `createMemory`, `updateMemory`, `deleteMemory` | `/memories` |
| Plans | `fetchPlans`, `createPlan`, `updatePlan`, `deletePlan` | `/plans` |
| Actions | `fetchActions`, `createAction`, `updateAction`, `deleteAction` | `/actions` |
| People CRUD | `fetchPeople`, `createPerson`, `updatePerson`, `deletePerson` | `/people` |
| People stats | `getMostMentioned`, `getPersonContacts`, `getMostConnected` | Various |

### EdgesAPIClient

**File:** `adaptersV3/api/EdgesAPIClient.js`

| Method | Endpoint | Description |
|---|---|---|
| `create(data)` | `POST /graph/edges` | Create edge |
| `fetchByNode(nodeId, dir)` | `GET /graph/edges/node/:nodeId` | Edges for node (in/out/both) |
| `delete(id)` | `DELETE /graph/edges/:id` | Remove |
| `traverse(nodeId, params)` | `GET /graph/traversal/:nodeId` | Graph traversal |
| `getGraphData()` | `GET /graph/graph-data` | Full graph data |
| `getMostConnected(limit=5)` | `GET /graph/most-connected` | Most connected nodes |

### MeasurementsAPIClient

**File:** `adaptersV3/api/MeasurementsAPIClient.js`

| Method | Endpoint |
|---|---|
| `create(nodeId, data)` | `POST /measurements/node/:nodeId` |
| `getByNode(nodeId)` | `GET /measurements/node/:nodeId` |
| `deleteByNode(nodeId)` | `DELETE /measurements/node/:nodeId` |

### AIAPIClient

**File:** `adaptersV3/api/AIAPIClient.js`

| Method | Endpoint | Description |
|---|---|---|
| `requestAnalysis(nodeId, data)` | `POST /ai/analysis/:nodeId` | Request AI analysis |
| `getAnalysis(nodeId)` | `GET /ai/analysis/:nodeId` | Get analysis results |
| `requestImage(nodeId, data)` | `POST /ai/image/:nodeId` | Request AI image |
| `getImages(nodeId)` | `GET /ai/image/:nodeId` | Get generated images |

### PeopleAPIClient (V3)

**File:** `adaptersV3/api/PeopleAPIClient.js`

Adds `getMostMentioned` and `getContacts` to standard CRUD.

| Method | Endpoint |
|---|---|
| `getAll(filters)` | `GET /people` |
| `getById(id)` | `GET /people/:id` |
| `getMostMentioned(limit=5)` | `GET /people/most-mentioned` |
| `getContacts(id)` | `GET /people/:id/contacts` |
| `create(data)` | `POST /people` |
| `update(id, data)` | `PUT /people/:id` |
| `delete(id)` | `DELETE /people/:id` |

### TagsAPIClient (V3)

**File:** `adaptersV3/api/TagsAPIClient.js`

Expanded from V2 with node-tag management and findOrCreate.

| Method | Endpoint | Description |
|---|---|---|
| `getAll(params)` | `GET /tags` | |
| `getById(id)` | `GET /tags/:id` | |
| `getMostUsed(params)` | `GET /tags/most-used` | |
| `getUnused()` | `GET /tags/unused` | |
| `getNodes(tagId)` | `GET /tags/:tagId/nodes` | Nodes using tag |
| `getByNode(nodeId)` | `GET /tags/node/:nodeId` | Tags on node |
| `create(data)` | `POST /tags` | |
| `findOrCreate(data)` | `POST /tags/find-or-create` | Upsert |
| `updateName(id, name)` | `PUT /tags/:id/name` | Rename |
| `delete(id)` | `DELETE /tags/:id` | |
| `setNodeTags(nodeId, tagIds)` | `PUT /tags/node/:nodeId` | Replace tags |

### EmotionsAPIClient (V3)

**File:** `adaptersV3/api/EmotionsAPIClient.js`

Node-based instead of entry-based. Adds timeline endpoint.

| Method | Endpoint |
|---|---|
| `getAll()` | `GET /emotions` |
| `getByCategory(cat)` | `GET /emotions/category/:cat` |
| `replaceNodeEmotions(nodeId, emotions)` | `PUT /emotions/node/:nodeId` |
| `getStats()` | `GET /emotions/stats` |
| `getMostFrequent(limit=10)` | `GET /emotions/most-frequent` |
| `getTimeline(granularity="day")` | `GET /emotions/timeline` |

### AnalyticsAPIClient (V3)

**File:** `adaptersV3/api/AnalyticsAPIClient.js`

Adds profile, emotion timeline, and node connections to V2 methods.

| Method | Endpoint |
|---|---|
| `getProfile()` | `GET /analytics/profile` |
| `getStats()` | `GET /analytics/stats` |
| `getEntriesByMonth(months=12)` | `GET /analytics/entries-by-month` |
| `getEmotionDistribution()` | `GET /analytics/emotion-distribution` |
| `getEmotionTimeline(granularity="day")` | `GET /analytics/emotion-timeline` |
| `getActivityHeatmap(year)` | `GET /analytics/activity-heatmap` |
| `getStreaks()` | `GET /analytics/streaks` |
| `getNodeConnections(limit=10)` | `GET /analytics/node-connections` |

---

## Repositories

Abstract contracts defining interfaces each domain needs. Most methods throw
"Not implemented" -- actual implementations live in the API clients.

### BaseRepository

**File:** `repositories/base/BaseRepository.js`

Abstract base with 5 CRUD methods, all throw descriptive errors.

| Method | Parameters | Throws |
|---|---|---|
| `getAll(filters)` | `{ }` | `getAll() must be implemented` |
| `getById(id)` | `id` | `getById() must be implemented` |
| `create(data)` | `data` | `create() must be implemented` |
| `update(id, data)` | `id, data` | `update() must be implemented` |
| `delete(id)` | `id` | `delete() must be implemented` |

### AuthRepository

**File:** `repositories/AuthRepository.js` -- Extends `BaseRepository`
Implemented by `AuthAPIClient` (which also extends this class).

| Method | Implemented by |
|---|---|
| `register(login, password)` | `AuthAPIClient.register()` |
| `login(login, password)` | `AuthAPIClient.login()` |
| `recover(backupCode, newPassword, captcha)` | `AuthAPIClient.recover()` |
| `logout()` | Not implemented |
| `checkPasswordStrength(password)` | `AuthAPIClient.checkPasswordStrength()` |
| `generatePasswordRecommendation()` | `AuthAPIClient.generatePasswordRecommendation()` |
| `isAuthenticated()` | Returns `true` (test stub) |

### EntriesRepository

**File:** `repositories/EntriesRepository.js` -- Extends `BaseRepository`

Has **partial implementation** with `createEntry(entryData)` that calls
`EntryMapper.toDTO()` and `EntriesAPIClient.create()` -- full implementation pending.

Additional methods: `search(query, limit)`. All others throw.

### EmotionsRepository

**File:** `repositories/EmotionsRepository.js` -- Extends `BaseRepository`

10 methods across catalog, entry attachment, and statistics. All throw.

| Category | Methods |
|---|---|
| Catalog | `getAll`, `getByCategory(category)` |
| Entry emotions | `getForEntry(entryId)`, `attachToEntry(entryId, emotions)`, `detachFromEntry(entryId)` |
| Statistics | `getStats(params)`, `getMostFrequent(limit)`, `getDistribution(params)`, `getTimeline(params)` |

### RelationsRepository

**File:** `repositories/RelationsRepository.js`

**Does NOT extend BaseRepository.** Standalone contract for entry-to-entry relationships.

| Category | Methods |
|---|---|
| Relations | `getForEntry(entryId)`, `create(relationData)`, `delete(id)` |
| Graph traversal | `getChain(entryId, params)`, `getGraph(entryId)` |
| Types | `getTypes()`, `getMostConnected(limit)` |

### TagsRepository

**File:** `repositories/TagsRepository.js` -- Extends `BaseRepository`

14 methods including CRUD, entry tagging, findOrCreate, similarity search.

| Category | Methods |
|---|---|
| CRUD | `getAll`, `getById`, `create(name)`, `update(id, name)`, `delete(id)` |
| Entry tagging | `getForEntry(entryId)`, `attachToEntry(entryId, tagIds)`, `detachFromEntry(entryId)` |
| Utilities | `findOrCreate(name)`, `getMostUsed(limit)`, `getUnused()`, `getSimilar(id, limit)`, `getEntriesByTag(id, limit)` |

### PeopleRepository

**File:** `repositories/PeopleRepository.js` -- Extends `BaseRepository`

| Method | Description |
|---|---|
| CRUD | `getAll(filters)`, `getById(id)`, `create(personData)`, `update(id, personData)`, `delete(id)` |
| `getMostMentioned(limit)` | Most frequently mentioned people |

### BodyStatesRepository

**File:** `repositories/BodyStatesRepository.js` -- Extends `BaseRepository`
Standard CRUD only. All throw.

### CircumstancesRepository

**File:** `repositories/CircumstancesRepository.js` -- Extends `BaseRepository`

Standard CRUD plus: `getWeatherStats(params)`, `getMoonPhaseStats(params)`. All throw.

### SkillsRepository

**File:** `repositories/SkillsRepository.js` -- Extends `BaseRepository`

Standard CRUD plus: `addProgress(skillId, data)`, `getProgressHistory(skillId)`,
`getCategories()`, `getTopSkills(limit)`. All throw.

### AnalyticsRepository

**File:** `repositories/AnalyticsRepository.js` -- Extends `BaseRepository`

No standard CRUD. Analytics-specific methods: `getOverallStats()`, `getEntriesByMonth(months)`,
`getEmotionDistribution(params)`, `getActivityHeatmap(year)`, `getStreaks()`. All throw.

---

## Data Flow

### V2 Data Flow (Entry Model)

```text
UI Component
  |
  v
Repository interface (e.g. EntriesRepository) -- abstract contract, throws if called
  |
  v
API Client (e.g. EntriesAPIClient) -- calls specific REST endpoint
  |
  v
apiClient (axios) -- adds auth token, calls backend, unwraps response.data
  |
  v
Mapper (EntryMapper.toDomain) -- snake_case -> camelCase
  |
  v
Domain object (plain object) -- returned to UI
```

**Auth path:** AuthAPIClient extends AuthRepository, so the repository pattern is
observed. Other V2 clients do not extend repositories -- they are used directly.

### V3 Data Flow (Graph Model)

```text
UI Component / Service
  |
  v
API Client V3 (e.g. NodesAPIClient, EdgesAPIClient) -- graph REST endpoints
  |
  v
apiClient (axios) -- same shared instance
  |
  v
Mapper V3 (NodeMapper.toDomain) -- creates class instance
  |
  v
Domain entity (Node, Edge instance) -- class with methods
```

### Write Flow

```text
UI Component -- user action
  |
  v
Mapper.toDTO() or NodeMapper.toDTO() -- camelCase -> snake_case
  |
  v
API Client.create/update -- sends DTO to backend
  |
  v
apiClient (axios) -- POST/PUT with auth token
  |
  v
Backend receives snake_case DTO
```

---

## Entity Relationships

### Node Connections (V3 Graph Model)

```text
Node (central entity)
  +-- edges      -> Edge[]     (relationships to other nodes)
  +-- emotions   -> array      (emotion objects with intensity)
  +-- tags       -> array      (tag associations)
  +-- measurement-> array      (physical measurements)
  +-- analysis   -> AIAnalysis[] (AI analysis results)
  +-- images     -> AIImage[]  (AI-generated images)
```

### Edge Direction

```text
Node A --[Edge: caused]-->  Node B
fromNodeId: A, toNodeId: B, edgeTypeCode: "caused"

Edge fetch supports direction parameter:
  "in"     -- edges pointing TO this node
  "out"    -- edges pointing FROM this node
  "both"   -- all edges connected to this node
```

### V2 Entry Relationships (Legacy)

```text
Entry (domain object from mapper)
  +-- emotions[]        -- emotion IDs/names
  +-- people[]          -- person associations
  +-- tags[]            -- tag associations
  +-- relations{}       -- entry-to-entry relationships
  +-- circumstanceId    -- link to Circumstance
  +-- bodyStateId       -- link to BodyState
```

---

## Missing Client Files

### V2 Clients Referenced but Not Implemented

The file `adapters/api/clients/index.js` exports 12 clients, but 5 of the
corresponding `.js` files do not exist:

| Client | Test File | Entity/Repo | Expected Endpoints |
|---|---|---|---|
| `EntriesAPIClient` | `__tests__/EntriesAPIClient.test.js` | EntriesRepository, EntryMapper | `/entries` CRUD, `/entries/search` |
| `BodyStatesAPIClient` | `__tests__/BodyStatesAPIClient.test.js` | BodyStatesRepository, BodyStateMapper | `/body-states` CRUD, `/body-states/latest`, stats |
| `CircumstancesAPIClient` | `__tests__/CircumstancesAPIClient.test.js` | CircumstancesRepository, CircumstanceMapper | `/circumstances` CRUD, `/circumstances/latest`, stats |
| `SkillsAPIClient` | `__tests__/SkillsAPIClient.test.js` | SkillsRepository, SkillMapper | `/skills` CRUD, `/skills/:id/progress`, `/skills/stats` |
| `RelationsAPIClient` | `__tests__/RelationsAPIClient.test.js` | RelationsRepository | `/relations` CRUD, `/relations/types`, `/relations/:entryId`, `/relations/most-connected` |

**Consequences:**
- Importing these clients will throw `Module not found` errors
- The corresponding mappers (BodyStateMapper, CircumstanceMapper, SkillMapper) have no
  API clients to use them
- The `EntriesRepository.createEntry()` method references `EntriesAPIClient` and `EntryMapper`
  but neither is functional
- Test files define the expected API contract for each missing client

**Resolution paths:**
1. Implement the missing client files using the test files as specification
2. Remove the exports from `index.js` and mark as deprecated
3. Migrate to V3 clients which cover most of the same functionality
