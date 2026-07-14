# Module 6: Tags

## Overview

The Tags module provides a user-defined tagging system. Users create tags and attach them to nodes, forming a many-to-many relationship. Tags are scoped per user — each user has an independent tag namespace.

**Location:** `src/modules/tags/`

---

## Architecture

```
Request → TagsController → TagsService → TagsRepository → PostgreSQL
                                      ↓
                               NodesRepository (ownership check)
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `TagsController` | `controllers/TagsController.ts` | HTTP handlers, pagination, query parsing |
| `TagsService` | `services/TagsService.ts` | Business logic, ownership validation, uniqueness checks |
| `TagsRepository` | `repositories/TagsRepository.ts` | All DB queries — tags CRUD, node-tag mapping, analytics |
| `tag.schema.ts` | `schemas/tag.schema.ts` | Zod validation schemas |

---

## Database Tables

### `tags` — User-defined tag definitions

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PK, SERIAL |
| `user_id` | INT | FK → `users.id` |
| `name` | VARCHAR | — |

**Unique constraint:** `UNIQUE(user_id, name)` — a user cannot create duplicate tags. Tag name regex: `/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/`, max 50 characters.

### `node_tags` — Junction table

| Column | Type | Constraints |
|--------|------|-------------|
| `node_id` | UUID | FK → `nodes.id` |
| `tag_id` | INT | FK → `tags.id` |

**Primary key:** Composite `(node_id, tag_id)` — enforces unique node-tag pairs.

---

## Validation Schemas

### `createTagSchema` / `updateTagSchema`
`body.name`: string, 1-50 chars, letters/numbers/underscore/dash only — supports Cyrillic.

### `tagIdSchema`
`params.id`: integer string, transformed to `number`.

### `getTagsSchema`
Query params: `search` (string), `sort` (`name`/`usage`/`created_at`, default `name`), `page`, `limit`.

### `mostUsedSchema`
Query params: `limit` (default 10), `min_usage` (default 1).

### `unusedSchema`
Query params: `older_than_days` (default 30).

### `entriesByTagSchema`
Query params: `page`, `limit`, `entry_type` (`dream`/`memory`/`thought`/`plan`/`all`, default `all`).

### `attachTagsSchema`
`body.tags`: array of positive integers, min 1 element.

---

## Endpoints

All routes require authentication via `authenticate` middleware.

| Method | Path | Controller | Service | Description |
|--------|------|-----------|---------|-------------|
| GET | `/` | `getTags` | `getTags()` | List tags (paginated, search) |
| GET | `/:id` | `getTagById` | `getTagById()` | Single tag by ID |
| POST | `/` | `createTag` | `createTag()` | Create a new tag |
| PUT | `/:id` | `updateTag` | `updateTag()` | Update tag name |
| DELETE | `/:id` | `deleteTag` | `deleteTag()` | Delete a tag |
| POST | `/find-or-create` | `findOrCreate` | `findOrCreate()` | Get or create tag |
| GET | `/:id/nodes` | `getNodesByTag` | `getNodesByTag()` | Nodes with this tag |
| GET | `/node/:nodeId` | `getTagsForNode` | `getTagsForNode()` | Tags for a node |
| PUT | `/node/:nodeId` | `replaceTagsForNode` | `replaceTagsForNode()` | Replace all tags |
| GET | `/most-used` | `getMostUsed` | `getMostUsed()` | Top tags by usage |
| GET | `/unused` | `getUnused` | `getUnused()` | Tags with zero usage |

### Route ordering note
Route order in `tags.routes.ts` is significant:
- `/most-used` and `/unused` are defined before `/:id` to avoid being matched as ID parameters
- `/node/:nodeId` is defined at the end to avoid matching as `:id`

---

## Service Logic

### `createTag(userId, name)`
1. Reject empty name
2. Search existing tags for case-insensitive match (`toLowerCase()`)
3. Throw `ValidationError` if duplicate found
4. Create with trimmed name

### `findOrCreate(userId, name)`
Case-insensitive lookup via `lower(name) = lower($2)`. Returns existing tag or creates new one.

### `getTags(userId, filters, page, limit)`
Paginated list with optional `ILIKE` search filter. Returns `{ data, pagination }` object with `page`, `limit`, `total`, `totalPages`.

**Note:** Pagination uses LIMIT/OFFSET — `total` equals returned row count, not total available rows.

### `replaceTagsForNode(nodeId, tagIds, userId)`
1. Validate node ownership
2. Validate each tag exists and belongs to user via `getTagById()`
3. Execute in transaction: DELETE all node_tags → INSERT each
4. Returns updated tag list

---

## Repository Query Patterns

### `TagsRepository.findByUserId(userId, filters, limit, offset)`
Dynamic query builder: starts with `WHERE user_id = $1`, conditionally appends `ILIKE` filter, always appends `ORDER BY name ASC LIMIT/OFFSET`.

### `TagsRepository.getNodesByTag(tagId, userId)`
Joins `node_tags` → `nodes` → `node_types`, filters by tag_id + user_id + `deleted_at IS NULL`, orders by `created_at DESC`.

### `TagsRepository.getMostUsed(userId, limit)`
Joins `tags` → `node_tags` → `nodes`, groups by tag, counts `node_id`, orders by count descending.

### `TagsRepository.getUnused(userId)`
Uses `NOT EXISTS` subquery on `node_tags` to find tags with no attached nodes.

### `TagsRepository.replaceTagsForNode(nodeId, tagIds, userId)`
Transaction-based: BEGIN → DELETE FROM node_tags → INSERT loop → COMMIT, with ROLLBACK on error.