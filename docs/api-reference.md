# API Reference

## OpenAPI 3.1.0

The API is fully documented with OpenAPI 3.1.0 spec.

**Swagger UI**: `http://localhost:3003/swagger`
**Swagger JSON**: `http://localhost:3003/swagger.json`

## Quick endpoints

### System
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | ❌ | Health check |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register (hCaptcha) |
| POST | `/api/v1/auth/login` | ❌ | Login (hCaptcha) |
| POST | `/api/v1/auth/recover` | ❌ | Password recovery (hCaptcha) |
| GET | `/api/v1/auth/verify` | ❌ | Validate token |
| POST | `/api/v1/auth/check-password-strength` | ❌ | Check password strength |
| GET | `/api/v1/auth/generate-password` | ❌ | Generate password recommendation |

### Graph — Reference (public)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/graph/node-types` | ❌ | Get all node types |
| GET | `/api/v1/graph/edge-types` | ❌ | Get all edge types |

### Graph — Auth required
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/graph/nodes` | ✅ | List nodes |
| POST | `/api/v1/graph/nodes` | ✅ | Create node |
| GET | `/api/v1/graph/nodes/:id` | ✅ | Get node |
| PUT | `/api/v1/graph/nodes/:id` | ✅ | Update node |
| DELETE | `/api/v1/graph/nodes/:id` | ✅ | Soft delete node |
| POST | `/api/v1/graph/edges` | ✅ | Create edge |
| GET | `/api/v1/graph/edges/node/:nodeId` | ✅ | Get edges for node |
| DELETE | `/api/v1/graph/edges/:id` | ✅ | Delete edge |
| GET | `/api/v1/graph/traversal/:nodeId` | ✅ | BFS traversal |
| GET | `/api/v1/graph/neighbors/:nodeId` | ✅ | Direct neighbors |
| GET | `/api/v1/graph-graph-data/:nodeId` | ✅ | Full graph dump |
| GET | `/api/v1/graph/most-connected` | ✅ | Top connected nodes |

### Domain entities (auth required, CRUD)
| Entity | GET `/` | GET `/:id` | POST `/` | PUT `/:id` | DELETE `/:id` | Special |
|--------|---------|------------|----------|------------|---------------|---------|
| `/api/v1/dreams` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/api/v1/thoughts` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/api/v1/memories` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/api/v1/plans` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/api/v1/actions` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/api/v1/people` | ✅ | ✅ | ✅ | ✅ | ✅ | `/most-mentioned`, `/:id/contacts` |

### Metadata (auth required)
| Entity | Endpoints |
|--------|-----------|
| `/api/v1/emotions` | GET `/` (public), GET `/category/:cat` (public), GET `/node/:id`, PUT `/node/:id`, DELETE `/node/:id`, GET `/stats`, GET `/most-frequent`, GET `/distribution` |
| `/api/v1/tags` | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`, POST `/find-or-create`, GET `/most-used`, GET `/unused`, GET `/:id/nodes`, GET `/node/:nodeId`, PUT `/node/:nodeId` |
| `/api/v1/measurements` | POST `/node/:nodeId`, GET `/node/:nodeId`, DELETE `/node/:nodeId` |

### AI + Analytics (auth required)
| Entity | Endpoints |
|--------|-----------|
| `/api/v1/ai` | POST/GET `/analysis/:nodeId`, POST/GET `/image/:nodeId` |
| `/api/v1/analytics` | GET `/profile`, `/stats`, `/entries-by-month`, `/emotion-distribution`, `/emotion-timeline`, `/activity-heatmap`, `/streaks`, `/node-connections` |

## Response envelope

All endpoints return consistent response format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication

```
Authorization: Bearer <jwt-token>
```

More details about how authentication works: [Auth module docs](../backend_docs/02-auth.md)