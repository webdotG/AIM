# Module 3: Graph Core

## Overview

The Graph Core is the central data structure of the application. It implements a graph database on top of PostgreSQL with nodes (entities) and edges (relationships). All domain entities — dreams, thoughts, memories, plans, actions, people, places, and more — are stored as nodes of a specific type, and can be interlinked through edges.

**Location:** `src/modules/graph/`

### Core Design Principles

1. **Facts are immutable** — INSERT is primary, UPDATE is restricted, DELETE is forbidden
2. **Graph is universal** — any entity can be linked to any other
3. **Interpretations are computed** — AI/analytics are derived but stored as generation facts
4. **DB guarantees integrity** — triggers and CHECKs, not just application validation
5. **Removal is a new fact** — soft delete via `deleted_at` only

---

## Architecture

```
HTTP Request
    → GraphController (Express, singleton)
        → GraphService (orchestrator)
            → NodesRepository (node CRUD, filtering, pagination)
            → EdgesRepository (edge CRUD, graph data, most connected)
            → TraversalRepository (BFS traversal, neighbor lookup)
            → NodeTypesRepository (reference lookup)
            → EdgeTypesRepository (reference lookup)
```

### Component Files

| File | Role |
|------|------|
| `src/modules/graph/controllers/GraphController.ts` | Singleton controller (`graphController`); all HTTP route handlers |
| `src/modules/graph/services/GraphService.ts` | Orchestrates all graph operations; ownership validation; error handling |
| `src/modules/graph/repositories/NodesRepository.ts` | Node CRUD, filtering, pagination |
| `src/modules/graph/repositories/EdgesRepository.ts` | Edge CRUD, graph data snapshot, most connected nodes |
| `src/modules/graph/repositories/NodeTypesRepository.ts` | Node type reference lookup |
| `src/modules/graph/repositories/EdgeTypesRepository.ts` | Edge type reference lookup |
| `src/modules/graph/repositories/TraversalRepository.ts` | BFS graph traversal, direct neighbor lookup |
| `src/modules/graph/schemas/graph.schema.ts` | Zod validation schemas |

---

## TypeScript Types (`src/shared/types/graph.types.ts`)

### Node Type Codes (16 types)

| Code | Description |
|------|-------------|
| `dream` | A recorded dream |
| `thought` | A thought or reflection |
| `memory` | A recollection of an event |
| `plan` | A future plan or intention |
| `action` | An activity or action taken |
| `person` | A person in the user's life |
| `place` | A physical location |
| `book` | A book reference |
| `project` | A project or endeavor |
| `conversation` | A recorded conversation |
| `movie` | A movie reference |
| `course` | An educational course |
| `website` | A website reference |
| `music` | A music reference |
| `article` | An article reference |

### Edge Type Codes (16 types)

| Code | Description |
|------|-------------|
| `mentions` | One entity mentions another |
| `caused` | Causal relationship |
| `resulted_in` | Outcome relationship |
| `inspired` | Inspiration relationship |
| `reminded_of` | Reminiscence relationship |
| `about` | Topical association |
| `contains` | Container/scontained relationship |
| `performed_with` | Co-participation |
| `completed_by` | Completion attribution |
| `created` | Creation attribution |
| `references` | Cross-reference |
| `symbolizes` | Symbolic meaning |
| `contradicts` | Opposing relationship |
| `depends_on` | Dependency |
| `belongs_to` | Membership relationship |
| `related_to` | General association |

### Interfaces

```typescript
interface Node {
  id: string;          // UUID (auto-generated)
  user_id: number;
  node_type_id: number;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface Edge {
  id: number;                  // BIGSERIAL
  from_node_id: string;        // UUID
  to_node_id: string;          // UUID
  edge_type_id: number;
  confidence: number | null;   // 0-1 range
  weight: number | null;       // >= 0
  created_at: Date;
  notes: string | null;
  deleted_at: Date | null;
}
```

---

## Controller (`src/modules/graph/controllers/GraphController.ts`)

Singleton instance exported as `graphController`. All methods follow the Express `(req, res, next)` pattern with a try/catch that delegates to `next(error)`.

### Node Routes

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/nodes` | `getNodes` — paginated list with filters |
| `GET` | `/nodes/:id` | `getNodeById` — single node by ID |
| `POST` | `/nodes` | `createNode` — create new node |
| `PUT` | `/nodes/:id` | `updateNode` — update node title |
| `DELETE` | `/nodes/:id` | `deleteNode` — soft delete |

### Edge Routes

| Method | Path | Handler |
|--------|------|---------|
| `POST` | `/edges` | `createEdge` — create new edge |
| `GET` | `/nodes/:nodeId/edges` | `getEdgesForNode` — edges connected to node |
| `DELETE` | `/edges/:id` | `deleteEdge` — soft delete |

### Traversal Routes

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/nodes/:nodeId/traverse` | `traverseGraph` — BFS traversal |
| `GET` | `/nodes/:nodeId/neighbors` | `getNeighbors` — direct neighbors |
| `GET` | `/graph/data` | `getGraphData` — full graph snapshot |
| `GET` | `/graph/most-connected` | `getMostConnected` — top nodes by connections |

### Reference Routes

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/node-types` | `getNodeTypes` — all node types |
| `GET` | `/edge-types` | `getEdgeTypes` — all edge types |

---

## Service Layer (`src/modules/graph/services/GraphService.ts`)

The service is the orchestrator between the controller and repositories. It instantiated with a DB pool and creates 5 repository instances.

### Node Operations

- **`createNode(userId, nodeTypeCode, title)`** — Validates node type against `VALID_NODE_TYPES` enum. Creates node via CTW query joining `node_types`. Throws `ValidationError` for invalid types.
- **`getNodes(userId, filters, page, limit)`** — Delegates to `NodesRepository.findByUserId()` and `countByUserId()`. Returns `{ data, pagination }` with `page`, `limit`, `total`, `totalPages`. Default: page 1, limit 50.
- **`getNodeById(nodeId, userId)`** — Single node lookup with ownership check. Throws `NotFoundError` if not found.
- **`updateNode(nodeId, userId, { title })`** — Verifies ownership first, then updates title. Only `title` field is updatable.
- **`deleteNode(nodeId, userId)`** — Verifies ownership, then calls `softDelete()` (sets `deleted_at = NOW()`).

### Edge Operations

- **`createEdge(userId, { from, to, type, confidence, weight, notes })`** — Validates `from !== to` (no self-loops). Checks both nodes belong to user. Defaults confidence/weight/notes to `null`.
- **`getEdgesForNode(nodeId, userId, direction)`** — Validates node ownership. Supports `outgoing`, `incoming`, `both` direction (default: `both`). Returns all connected edges.
- **`deleteEdge(edgeId)`** — Soft deletes edge by setting `deleted_at`.

### Traversal Operations

- **`traverseGraph(startNodeId, userId, options)`** — Validates start node ownership. Delegates to `TraversalRepository.traverse()`.
- **`getNeighbors(nodeId, userId)`** — Validates start node ownership. Returns direct neighbor nodes with link count.
- **`getGraphData(userId)`** — Returns all nodes and edges for the user in a single snapshot.
- **`getMostConnected(userId, limit)`** — Returns top nodes ranked by connection count. Default limit: 10.

### Reference Operations

- **`getNodeTypes()`** — Returns all 15 node types from `node_types` table.
- **`getEdgeTypes()`** — Returns all 16 edge types from `edge_types` table.

---

## Repository Layer

### NodesRepository (`src/modules/graph/repositories/NodesRepository.ts`)

Extends `BaseRepository`. Key methods:

| Method | Description |
|--------|-------------|
| `findByUserId(userId, filters, pagination)` | Paginated list with optional `node_type_code`, `search` (ILIKE), `from_date`, `to_date` filters |
| `countByUserId(userId, filters)` | Count query for pagination. Supports `node_type_code` filter |
| `findById(id, userId)` | Single node by UUID with ownership check |
| `create(userId, nodeTypeCode, title)` | Uses CTE: INSERT into `nodes` by looking up `node_type_id` from `node_types.code`. Returns full row |
| `updateTitle(id, userId, title)` | Updates `title` and `updated_at`. NULL-safe |
| `softDelete(id, userId)` | Sets `deleted_at` and `updated_at` to `NOW()` |
| `belongsToUser(nodeId, userId)` | Ownership check returning boolean |

All queries include `AND n.deleted_at IS NULL` to exclude soft-deleted nodes.

### EdgesRepository (`src/modules/graph/repositories/EdgesRepository.ts`)

Extends `BaseRepository`. Key methods:

| Method | Description |
|--------|-------------|
| `findByNode(nodeId, direction)` | Queries edges with `from_node_id = $1`, `to_node_id = $1`, or both |
| `create(from, to, typeCode, confidence, weight, notes)` | INSERT by looking up `edge_type_id` from `edge_types.code` |
| `softDelete(id)` | Sets `deleted_at = NOW()` |
| `findChain(startNodeId, direction, depth)` | Recursive CTE for BFS in SQL (depth-limited, cycle detection via path array) |
| `getGraphData(userId)` | Full snapshot: selects all user's nodes + edges where both endpoints belong to user |
| `getMostConnected(userId, limit)` | LEFT JOIN on edges, COUNTs connections, groups by node, orders DESC, excludes 0-connection nodes |

### TraversalRepository (`src/modules/graph/repositories/TraversalRepository.ts`)

Extends `BaseRepository`. Implements application-level BFS traversal.

**`traverse(startNodeId, userId, options)`**
- Uses a `Set<string>` for visited nodes (cycle prevention)
- BFS queue: `{ nodeId, depth, parentNodeId }`
- Max depth: min(requested, 20) — capped at 20 levels
- Per-level SQL query for neighbors with dynamic filters:
  - `filterEdgeType` — restricts by `edge_types.code`
  - `minConfidence` — `e.confidence >= $N`
  - `filterNodeType` — post-filter check in application layer
- Direction logic:
  - `forward`: follows `from_node_id → to_node_id`
  - `backward`: follows `to_node_id → from_node_id`
  - `both`: uses `CASE` expression to pick opposite node
- Returns `{ path: [], edges: [] }` — paths contain `node_id`, `node_title`, `node_type_code`, `depth`

**`getNeighbors(nodeId, userId)`**
- Single SQL query joining `edges`, `nodes`, `node_types`
- Anchors via `anchor` node (ensures ownership check)
- Returns distinct neighbors with `COUNT(e.id) AS link_count`
- Ordered by `link_count DESC`

### NodeTypesRepository & EdgeTypesRepository

Simple reference lookup repositories with `findAll()`, `findById(id)`, and `findByCode(code)` methods.

---

## Zod Schemas (`src/modules/graph/schemas/graph.schema.ts`)

| Schema | Validated Fields |
|--------|-----------------|
| `createNodeSchema` | `body.node_type_code` (enum), `body.title` (string, max 300, optional/nullable) |
| `updateNodeSchema` | `params.id` (UUID), `body.title` (string, max 300, optional/nullable) |
| `nodeParamsSchema` | `params.id` (UUID) |
| `createEdgeSchema` | `body.from_node_id` (UUID), `body.to_node_id` (UUID), `body.edge_type_code` (enum), `body.confidence` (0-1, optional), `body.weight` (0-1000, optional), `body.notes` (max 1000, optional) |
| `edgeParamsSchema` | `params.id` (numeric string) |
| `traversalSchema` | `params.nodeId` (UUID), `query.direction` (enum), `query.depth` (numeric string), `query.filterNodeType` (enum), `query.filterEdgeType` (enum), `query.minConfidence` (decimal string) |

---

## Database Schema

### Core Tables

**`nodes`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` |
| `user_id` | INT | FK → `users(id)` ON DELETE CASCADE |
| `node_type_id` | INT | FK → `node_types(id)` |
| `title` | VARCHAR(300) | Nullable |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |
| `deleted_at` | TIMESTAMP | Nullable (soft delete marker) |

**`edges`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGSERIAL | PK |
| `from_node_id` | UUID | FK → `nodes(id)` ON DELETE CASCADE |
| `to_node_id` | UUID | FK → `nodes(id)` ON DELETE CASCADE |
| `edge_type_id` | INT | FK → `edge_types(id)` |
| `confidence` | NUMERIC(5,4) | CHECK (>= 0 AND <= 1) |
| `weight` | NUMERIC(8,3) | CHECK (>= 0) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `notes` | TEXT | Nullable |
| `deleted_at` | TIMESTAMP | Nullable (soft delete marker) |
| — | — | CHECK (`from_node_id <> to_node_id`) |

**`node_types`** — Reference table (immutable)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PK |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | Nullable |

**`edge_types`** — Reference table (immutable)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PK |
| `code` | VARCHAR(60) | UNIQUE, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | Nullable |

### Child Tables

Each node type has a dedicated child table with type-specific fields. Every child table's primary key is `node_id UUID REFERENCES nodes(id) ON DELETE CASCADE`.

| Child Table | Node Type | Key Fields |
|-------------|-----------|------------|
| `dreams` | dream | content (TEXT), dream_date, lucidity (1-10), vividness (1-10), nightmare (BOOL) |
| `thoughts` | thought | content (TEXT), importance (1-10), confidence (1-10) |
| `memories` | memory | content (TEXT), event_date (DATE), confidence (1-10) |
| `plans` | plan | description (TEXT), deadline, priority (1-10), completed (BOOL), completed_at |
| `actions` | action | activity_id (FK), started_at, finished_at, description |
| `people` | person | full_name (VARCHAR 200), nickname, birth_date, relationship, notes |
| `places` | place | title, address, location (PostGIS POINT) |
| `projects` | project | description, started_at, finished_at, status |
| `books` | book | title (TEXT), author, isbn (VARCHAR 30), pages (INT) |

Types `conversation`, `movie`, `course`, `website`, `music`, and `article` are defined in the enum and `node_types` table but do not yet have dedicated child tables.

### Partial Indexes

All indexes use partial conditions (`WHERE deleted_at IS NULL` or `IS NOT NULL`) to optimize live-data queries and keep index size small.

**Node indexes:**
| Index | Columns | Condition |
|-------|---------|-----------|
| `idx_nodes_user` | `user_id` | `deleted_at IS NULL` |
| `idx_nodes_type` | `node_type_id` | `deleted_at IS NULL` |
| `idx_nodes_created` | `created_at` | `deleted_at IS NULL` |
| `idx_nodes_deleted` | `deleted_at` | `deleted_at IS NOT NULL` |

**Edge indexes:**
| Index | Columns | Condition |
|-------|---------|-----------|
| `idx_edges_from` | `from_node_id` | `deleted_at IS NULL` |
| `idx_edges_to` | `to_node_id` | `deleted_at IS NULL` |
| `idx_edges_type` | `edge_type_id` | `deleted_at IS NULL` |
| `idx_edges_deleted` | `deleted_at` | `deleted_at IS NOT NULL` |

### DB Triggers

**`trg_prevent_node_delete`** — BEFORE DELETE on `nodes`. Raises exception: *"Hard delete on nodes is forbidden. Use UPDATE deleted_at = NOW() instead."*

**`trg_nodes_type_consistency`** — AFTER INSERT or UPDATE OF `node_type_id` on `nodes`. Validates that a node of a given type has a corresponding record in its child table (e.g., a `dream` node must have a row in `dreams`). Uses dynamic SQL via `format()`.

---

## Security & Integrity

- **User ownership gating** — Every node and edge operation includes `WHERE user_id = $1`. Edges validate both source and target nodes belong to the requesting user.
- **Hard DELETE forbidden** — PostgreSQL trigger `trg_prevent_node_delete` blocks any `DELETE FROM nodes`. Only soft delete via `UPDATE deleted_at` is allowed.
- **Self-loop prevention** — `edges` has `CHECK (from_node_id <> to_node_id)`. Application also rejects `from === to` edges.
- **Type consistency** — Trigger `trg_nodes_type_consistency` enforces that each node has a matching child-table record.
- **Confidence/weight constraints** — `confidence` CHECK (0-1), `weight` CHECK (>= 0).
- **Cascading** — `nodes → edges ON DELETE CASCADE` at DB level (but node hard delete is blocked by trigger). Child tables cascade from `nodes`.

---

## Performance Considerations

- **Partial indexes** — Exclude soft-deleted rows from live indexes, improving query performance and reducing index bloat.
- **Redis reference cache** — `node_types` and `edge_types` are cached in Redis with 24h TTL. Key patterns: `ref:node_type:{code}`, `ref:edge_type:{code}`. Lookup via `getNodeTypeFromCache()` in `NodesRepository.create()`.
- **CTE-based inserts** — Node and edge creation use `WITH` queries that join reference tables, avoiding separate lookup queries.
- **Traversal depth cap** — BFS traversal capped at 20 levels maximum to prevent runaway queries.
- **Visited set** — BFS uses a `Set<string>` to detect cycles and avoid revisiting nodes.
- **Ownership in edges** — `getGraphData()` uses `EXISTS` subqueries to ensure both edge endpoints belong to the user.