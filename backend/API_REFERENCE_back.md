# API Reference

> Base URL: `http://localhost:3003/api/v1`
>
> All responses wrapped: `{ success: boolean, data: any, error?: string }`
>
> Pagination: `{ data: [...], pagination: { page, limit, total, totalPages } }`
>
> Full CRUD responses for specialized endpoints return `{ node: {...}, type: {...} }`.

---

## Authentication

### `POST /auth/register`

```json
{
  "login": "string (max 50)",
  "password": "string (min 12)",
  "backup_code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "expires_in": "7d"
  }
}
```

### `POST /auth/login`

**Response:** Same as register.

### `POST /auth/recover`

**Body:** `{ login, backup_code }`
Response: `{ success: true }`

### `GET /auth/verify`

**Response:** `{ userId: 1, valid: true }`

---

## Graph (Core)

### `GET /graph/nodes`

**Query:** `page, limit, node_type_code, search, from_date, to_date`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "user_id": 1,
        "node_type_id": 1,
        "title": "My dream",
        "node_type_code": "dream",
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 5, "totalPages": 1 }
  }
}
```

### `POST /graph/nodes`

**Body:** `{ node_type_code: "dream", title: "My dream" }`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": 1,
    "node_type_id": 1,
    "title": "My dream",
    "node_type_code": "dream"
  }
}
```

### `DELETE /graph/nodes/:id`

Soft delete (sets `deleted_at = NOW()`). Physical delete prohibited by DB triggers.

**Response:** `{ success: true }`

### `POST /graph/nodes/:id/restore`

Restores a soft-deleted node (sets `deleted_at = NULL`).

**Response:** `{ success: true }`

### `POST /graph/edges`

**Body:** `{ from_node_id, to_node_id, edge_type_code, confidence?, weight?, notes? }`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_node_id": "uuid",
    "to_node_id": "uuid",
    "edge_type_code": "caused",
    "confidence": 0.9
  }
}
```

### `GET /graph/edges/node/:nodeId`

**Query:** `direction: outgoing|incoming|both`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "from_node_id": "uuid",
        "to_node_id": "uuid",
        "edge_type_code": "caused",
        "confidence": 0.9,
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 1, "total": 1, "totalPages": 1 }
  }
}
```

### `GET /graph/traversal/:nodeId`

**Query:** `direction: forward|backward|both, depth, filterNodeType, filterEdgeType, minConfidence`

**Response:**
```json
{
  "success": true,
  "data": {
    "path": [
      {
        "node_id": "uuid",
        "node_title": "Node B",
        "node_type_code": "thought",
        "depth": 1
      }
    ],
    "edges": [
      {
        "edge_id": "1",
        "edge_type_code": "caused",
        "from_node": "uuid-a",
        "to_node": "uuid-b"
      }
    ]
  }
}
```

### `GET /graph/graph-data`

**Response:** `{ success: true, data: { nodes: [...], edges: [...] } }`

### `GET /graph/most-connected`

**Query:** `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Most connected",
        "node_type_code": "dream",
        "connection_count": 5
      }
    ],
    "pagination": { "page": 1, "limit": 3, "total": 3, "totalPages": 1 }
  }
}
```

---

## Dreams

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/dreams` | ✅ | `page, limit, from, to, nightmare` |
| GET | `/dreams/:id` | ✅ | — |
| POST | `/dreams` | ✅ | — |
| PUT | `/dreams/:id` | ✅ | — |
| DELETE | `/dreams/:id` | ✅ | — |

**Create Body:**
```json
{
  "title": "Dream title",
  "content": "Dream text",
  "dream_date": "ISO date",
  "lucidity": 1-10,
  "vividness": 1-10,
  "nightmare": false,
  "sleep_start": "ISO datetime",
  "sleep_end": "ISO datetime"
}
```

**List Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      { "id": "uuid", "title": "...", "content": "...", "dream_date": "...", "lucidity": 5, "vividness": 8, "nightmare": false }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
  }
}
```

**Single Response (`GET /dreams/:id`):**
```json
{
  "success": true,
  "data": {
    "node": { "id": "uuid", "title": "...", "node_type_code": "dream", ... },
    "dream": { "node_id": "uuid", "content": "...", "dream_date": "...", ... }
  }
}
```

---

## Thoughts

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/thoughts` | ✅ | `page, limit, from_date, to_date, search` |
| GET | `/thoughts/:id` | ✅ | — |
| POST | `/thoughts` | ✅ | — |
| PUT | `/thoughts/:id` | ✅ | — |
| DELETE | `/thoughts/:id` | ✅ | — |

**Create Body:** `{ title?, content, importance: 1-10, confidence: 1-10 }`

---

## Memories

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/memories` | ✅ | `page, limit, from_date, to_date, search` |
| GET | `/memories/:id` | ✅ | — |
| POST | `/memories` | ✅ | — |
| PUT | `/memories/:id` | ✅ | — |
| DELETE | `/memories/:id` | ✅ | — |

**Create Body:** `{ title?, content, event_date, confidence: 1-10 }`

**List Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "node": { "id": "uuid", "title": "...", "content": "...", "event_date": "2025-06-15" },
        "memory": { "content": "...", "event_date": "2025-06-15", "confidence": 8, "node_id": "uuid" }
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
  }
}
```

**Single Response (`GET /memories/:id`):**
```json
{
  "success": true,
  "data": {
    "node": { "id": "uuid", "title": "...", "node_type_code": "memory", ... },
    "memory": { "node_id": "uuid", "content": "...", "event_date": "...", ... }
  }
}
```

---

## Plans

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/plans` | ✅ | `page, limit, completed, overdue, from_date, to_date, search` |
| GET | `/plans/:id` | ✅ | — |
| POST | `/plans` | ✅ | — |
| PUT | `/plans/:id` | ✅ | — |
| DELETE | `/plans/:id` | ✅ | — |

**Create Body:** `{ title?, description, deadline, priority: 1-10 }`
**Update Body:** `{ completed: true }` → auto-sets `completed_at`

---

## Actions

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/actions` | ✅ | `page, limit, from_date, to_date, search` |
| GET | `/actions/:id` | ✅ | — |
| POST | `/actions` | ✅ | — |
| PUT | `/actions/:id` | ✅ | — |
| DELETE | `/actions/:id` | ✅ | — |

**Create Body:** `{ title?, description, activity_id, started_at, finished_at }`

---

## People

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/people` | ✅ | `page, limit, search, relationship` |
| GET | `/people/most-mentioned` | ✅ | `limit` |
| GET | `/people/:id` | ✅ | — |
| GET | `/people/:id/contacts` | ✅ | — |
| POST | `/people` | ✅ | — |
| PUT | `/people/:id` | ✅ | — |
| DELETE | `/people/:id` | ✅ | — |

**Create Body:** `{ title?, full_name, nickname?, birth_date?, relationship?, notes? }`

---

## Emotions (27, UC Berkeley)

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/emotions` | ❌ | — |
| GET | `/emotions/category/:category` | ❌ | — |
| PUT | `/emotions/node/:nodeId` | ✅ | — |
| GET | `/emotions/stats` | ✅ | — |
| GET | `/emotions/most-frequent` | ✅ | `limit` |
| GET | `/emotions/timeline` | ✅ | `granularity: day/week/month` |

**PUT Body (replace all emotions of a node):**
```json
{
  "emotions": [
    { "emotion_id": 1, "intensity": 7 },
    { "emotion_id": 5, "intensity": 3 }
  ]
}
```

**Full list:** admiration, adoration, aesthetic_appreciation, amusement, anger, anxiety, awe, awkwardness, boredom, calmness, confusion, craving, disgust, empathic_pain, entrancement, excitement, fear, horror, interest, joy, nostalgia, relief, romance, sadness, satisfaction, sexual_desire, surprise

---

## Tags

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/tags` | ✅ | `page, limit, search` |
| GET | `/tags/most-used` | ✅ | `limit` |
| GET | `/tags/unused` | ✅ | — |
| GET | `/tags/:id` | ✅ | — |
| GET | `/tags/:id/nodes` | ✅ | — |
| POST | `/tags` | ✅ | — |
| POST | `/tags/find-or-create` | ✅ | — |
| PUT | `/tags/:id/name` | ✅ | — |
| DELETE | `/tags/:id` | ✅ | — |
| GET | `/tags/node/:nodeId` | ✅ | — |
| PUT | `/tags/node/:nodeId` | ✅ | — |

**Create Body:** `{ name: "tag name" }`

**PUT Body (replace all tags of a node):**
```json
{ "tag_ids": [1, 2, 3] }
```

**Most-used Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      { "name": "frequent", "usage_count": 3 },
      { "name": "rare", "usage_count": 1 }
    ],
    "pagination": { "page": 1, "limit": 2, "total": 2, "totalPages": 1 }
  }
}
```

**Find-or-create Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "id": 123,
      "name": "new-tag",
      "user_id": 1
    }
  }
}
```

---

## Measurements

| Method | Path | Auth |
|--------|------|------|
| POST | `/measurements/node/:nodeId` | ✅ |
| GET | `/measurements/node/:nodeId` | ✅ |
| DELETE | `/measurements/node/:nodeId` | ✅ |

**Create Body:**
```json
{
  "measurement_id": 1,
  "value_integer": 5,   // Choose exactly ONE
  "unit": "km"
}
```

Response: `{ success: true, data: [...] }`

---

## Analytics

| Method | Path | Auth | Query |
|--------|------|------|-------|
| GET | `/analytics/profile` | ✅ | — |
| GET | `/analytics/stats` | ✅ | — |
| GET | `/analytics/entries-by-month` | ✅ | `months` |
| GET | `/analytics/emotion-distribution` | ✅ | — |
| GET | `/analytics/emotion-timeline` | ✅ | `granularity: day/week/month` |
| GET | `/analytics/activity-heatmap` | ✅ | `year` |
| GET | `/analytics/streaks` | ✅ | — |
| GET | `/analytics/node-connections` | ✅ | `limit` |

**Profile Response:**
```json
{
  "node_stats": { "dream": 5, "thought": 12, "memory": 3, "plan": 8, "action": 2 },
  "emotion_distribution": [
    { "category": "positive", "count": 45, "avg_intensity": 6.2 },
    { "category": "negative", "count": 23, "avg_intensity": 4.5 }
  ],
  "streaks": { "current_streak": 12, "is_current": true },
  "total_nodes": 20
}
```

---

## AI

> Service layer on top of Graph. Reads node content, sends to external AI service.

| Method | Path | Auth |
|--------|------|------|
| POST | `/ai/analysis/:nodeId` | ✅ |
| GET | `/ai/analysis/:nodeId` | ✅ |
| POST | `/ai/image/:nodeId` | ✅ |
| GET | `/ai/image/:nodeId` | ✅ |

**Request Analysis Body:** `{ analysis_type: "jungian", model?: "default" }`

**Request Image Body:** `{ prompt?: "custom prompt or null (uses node content)" }`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "image_url": "https://...",
    "prompt": "...",
    "ai_model": "dall-e-3"
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 10 requests | 15 min |
| Register / Recover | 3 requests | 1 hour |
| API (general) | 100 requests | 15 min |
| Search | 30 requests | 1 min |
| AI | 10 requests | 1 min |

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Validation error / bad input |
| 401 | Unauthorized / expired token |
| 403 | Access denied |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:** `{ success: false, error: "Importance must be between 1 and 10" }`

---

## Middleware Pipeline

```
Helmet → CORS → express.json() → Rate Limit → Sanitizers → Auth → Controller → Service → Repository → DB
```

**Sanitizers (automatic):** trim, length, encoding, sql_injection, xss, command_injection, path_traversal, crlf

---

## Commands

```bash
npm run dev               # Start with hot reload
npm run start             # Production start
npm run migrate           # Apply migrations
npm run migrate:test      # Test DB migration
npm run test:unit         # Unit (0.6s)
npm run test:integration # Integration (with TZ=UTC)
npm run test:e2e          # Full HTTP tests
npm run ci                # lint + typecheck + unit
npm run db:test:up        # PostGIS + Redis
npm run db:test:down      # Stop services
```