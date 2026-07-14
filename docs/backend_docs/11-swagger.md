# Swagger / OpenAPI Documentation

## Quick Start

```bash
npm run dev          # Swagger UI: http://localhost:3003/swagger
                     # Swagger JSON: http://localhost:3003/swagger.json
                     # API: http://localhost:3003/api/v1
```

## Files

| File | Purpose |
|------|---------|
| `swagger.yaml` | OpenAPI 3.1.0 specification (3588 lines) |
| `src/index.ts` | Express app — mounts swagger-ui-express at `/swagger` |

## Endpoints in Spec

| Metric | Count |
|--------|-------|
| Paths | 56 |
| Operations | 87 |
| Tags | 14 |
| Schemas | 15 |

### Tags

| Tag | Tag |
|-----|-----|
| System | Health check (1 op) |
| Auth | Register, login, recover, verify, password strength/generate (6 ops) |
| Graph | Node types, edge types, node CRUD, edge CRUD, traversal, neighbors, graph-data, most-connected (15 ops) |
| Dreams | CRUD with lucidity/vividness/nightmare (5 ops) |
| Thoughts | CRUD with importance/confidence (5 ops) |
| Memories | CRUD with event_date/confidence (5 ops) |
| Plans | CRUD with deadline/priority/completion (5 ops) |
| Actions | CRUD with activity/schedule (5 ops) |
| People | CRUD + most-mentioned + contacts (7 ops) |
| Emotions | List, category (2 public) + node emotions, stats, distribution (6 ops, auth) |
| Tags | CRUD + findOrCreate + node mapping + most-used/unused (10 ops) |
| Measurements | Create/get/delete per node (3 ops) |
| AI | Analysis/image request + get (4 ops) |
| Analytics | Profile, stats, entries-by-month, emotion-distribution/timeline, heatmap, streaks, connections (8 ops) |

### Public vs Auth

10 endpoints are public. All others require `Authorization: Bearer <JWT>`.

### Response Envelope

Every endpoint returns:
```json
{ "success": true, "data": { ... } }
// or
{ "success": false, "error": "message" }
```

## How to Use Swagger UI

1. Open `http://localhost:3003/swagger`
2. Click **Authorize** → enter `Bearer <your-jwt-token>`
3. Expand any endpoint → click **Try it out** → **Execute**
4. Request/response schemas are interactive

## How to Use Swagger JSON

- Get raw spec: `http://localhost:3003/swagger.json`
- Download: `curl -o swagger.json http://localhost:3003/swagger.json`
- Use with any OpenAPI tool (Postman, Insomnia, code generators, etc.)

## Regenerate Spec

Edit `backend/swagger.yaml` directly. No npm needed.

Validate: `npm run swagger-serve` (counts paths + operations).

## Serving (wired in `src/index.ts`)

```typescript
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';

const swaggerDocument = yaml.parse(fs.readFileSync('swagger.yaml', 'utf8'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (req, res) => res.json(swaggerDocument));
```

Skips sanitization middleware for `/health`, `/favicon.ico`, `/swagger.json`.