# 04 — Domain Entities

## Overview

Domain entities are the 6 primary content types that users create, read, update, and delete within the application: **Dreams**, **Thoughts**, **Memories**, **Plans**, **Actions**, and **People**.

Every domain entity follows an identical architectural pattern:

```
Controller → Service (orchestrates transaction) → Repository (DB queries)
```

Each entity is represented as:
- A **graph node** in the `nodes` table, with a specific type code (e.g., `'dream'`, `'thought'`)
- A **child record** in an entity-specific table (e.g., `dreams`, `thoughts`), linked to the node via `node_id`

All entity module files are located under:

```
src/modules/{dreams,thoughts,memories,plans,actions,people}/
```

---

## Common CRUD Pattern

Every domain entity implements the same 5 operations. The patterns below are universal across all 6 entities.

### CREATE

```
1. BEGIN transaction
2. Create graph node:  nodesRepo.create(userId, 'type_code', title)
3. Create child record: entityRepo.create(node.id, data)
4. COMMIT transaction     (or ROLLBACK on error)
```

The node is inserted first so that its auto-generated `id` is available as the foreign key for the child record. If any step fails, the entire transaction rolls back, leaving the database in a consistent state.

### READ LIST

```
1. JOIN nodes WITH entity table, WHERE user_id AND deleted_at IS NULL
2. Apply filters (date range, search text, entity-specific)
3. ORDER BY date DESC
4. Return paginated results
```

The JOIN ensures that only entities belonging to the requesting user are returned. Soft-deleted records are excluded by checking `deleted_at IS NULL`.

### READ SINGLE

```
1. Find node by ID + user_id
2. Find child record by node_id
3. Return { node, entity }
```

Ownership is verified at the node level — a user can only read records they own.

### UPDATE

```
1. BEGIN transaction
2. Verify ownership via getEntityById
3. If title changed: update node title
4. Update child record fields
5. COMMIT transaction
```

Ownership verification prevents users from modifying records they do not own. The title lives on the node, while entity-specific attributes live on the child record.

### DELETE (Soft)

```
1. BEGIN transaction
2. Verify ownership
3. Set deleted_at on child record
4. Set deleted_at on node
5. COMMIT transaction
```

Deletion is always soft. The `deleted_at` timestamp is set on both the node and its child record. Because READ queries filter on `deleted_at IS NULL`, soft-deleted records are effectively invisible to the user.

---

## Entity Details

### 1. Dreams

| Property       | Value                     |
|----------------|---------------------------|
| Node type code | `'dream'`                 |
| Child table    | `dreams`                  |
| Module path    | `src/modules/dreams/`     |

**Child table schema — `dreams`**

| Column       | Details                              |
|--------------|--------------------------------------|
| `node_id`    | PK → `nodes.id`                      |
| `content`    | Text; required                       |
| `dream_date` | Date of the dream                    |
| `lucidity`   | Integer 1–10                         |
| `vividness`  | Integer 1–10                         |
| `nightmare`  | Boolean                              |
| `sleep_start`| Timestamp when sleep began           |
| `sleep_end`  | Timestamp when sleep ended           |
| `deleted_at` | Soft-delete timestamp                |

**Validation**
- `content` is required
- `lucidity` must be between 1 and 10
- `vividness` must be between 1 and 10

**Filters**
- `from_date` / `to_date` — filtered by `dream_date`
- `nightmare` — boolean filter

---

### 2. Thoughts

| Property       | Value                     |
|----------------|---------------------------|
| Node type code | `'thought'`               |
| Child table    | `thoughts`                |
| Module path    | `src/modules/thoughts/`   |

**Child table schema — `thoughts`**

| Column       | Details                              |
|--------------|--------------------------------------|
| `node_id`    | PK → `nodes.id`                      |
| `content`    | Text; required                       |
| `importance` | Integer 1–10                         |
| `confidence` | Integer 1–10                         |
| `deleted_at` | Soft-delete timestamp                |

**Validation**
- `content` is required

**Filters**
- `from_date` / `to_date` — filtered by `created_at`
- `search` — case-insensitive search across `content` and `title` (ILIKE)

---

### 3. Memories

| Property       | Value                    |
|----------------|--------------------------|
| Node type code | `'memory'`               |
| Child table    | `memories`               |
| Module path    | `src/modules/memories/`  |

**Child table schema — `memories`**

| Column       | Details                              |
|--------------|--------------------------------------|
| `node_id`    | PK → `nodes.id`                      |
| `content`    | Text; required                       |
| `event_date` | Date of the remembered event         |
| `confidence` | Integer 1–10                         |
| `deleted_at` | Soft-delete timestamp                |

**Validation**
- `content` is required

**Filters**
- `from_date` / `to_date` — filtered by `event_date`
- `search` — case-insensitive text search

---

### 4. Plans

| Property       | Value                   |
|----------------|-------------------------|
| Node type code | `'plan'`                |
| Child table    | `plans`                 |
| Module path    | `src/modules/plans/`    |

**Child table schema — `plans`**

| Column        | Details                              |
|---------------|--------------------------------------|
| `node_id`     | PK → `nodes.id`                      |
| `description` | Text; required                       |
| `deadline`    | Deadline timestamp                   |
| `priority`    | Integer 1–10                         |
| `completed`   | Boolean                              |
| `completed_at`| Timestamp when plan was completed    |
| `deleted_at`  | Soft-delete timestamp                |

**Validation**
- `description` is required

**Filters**
- `completed` — boolean filter for completed or incomplete plans
- `overdue` — plans that are not completed and `deadline < NOW()`
- `from_date` / `to_date` — filtered by `deadline`
- `search` — case-insensitive text search

---

### 5. Actions

| Property       | Value                     |
|----------------|---------------------------|
| Node type code | `'action'`                 |
| Child table    | `actions`                  |
| Module path    | `src/modules/actions/`     |

**Child table schema — `actions`**

| Column        | Details                              |
|---------------|--------------------------------------|
| `node_id`     | PK → `nodes.id`                      |
| `activity_id` | FK → `activities.id`                 |
| `started_at`  | Timestamp when action started        |
| `finished_at` | Timestamp when action ended          |
| `description` | Freeform text                        |
| `deleted_at`  | Soft-delete timestamp                |

**Filters**
- `from_date` / `to_date` — filtered by `started_at`

---

### 6. People

| Property       | Value                    |
|----------------|--------------------------|
| Node type code | `'person'`               |
| Child table    | `people`                 |
| Module path    | `src/modules/people/`    |

**Child table schema — `people`**

| Column        | Details                              |
|---------------|--------------------------------------|
| `node_id`     | PK → `nodes.id`                      |
| `full_name`   | Text; required                       |
| `nickname`    | Alias name                           |
| `birth_date`  | Date of birth                        |
| `relationship`| Relationship to the user             |
| `notes`       | Freeform notes                       |
| `deleted_at`  | Soft-delete timestamp                |

**Validation**
- `full_name` is required

**Filters**
- `search` — case-insensitive search on `full_name`

**Unique Endpoints**
- `GET /most-mentioned` — returns people most frequently referenced across graph connections
- `GET /:id/contacts` — returns the contact connections associated with a specific person

---

## Additional Entity Tables

The following tables store data that is not managed through the domain entity modules but is still part of the graph node system:

### places

| Column     | Details                        |
|------------|--------------------------------|
| `title`    | Name of the place              |
| `address`  | Street address                 |
| `location` | PostGIS `GEOGRAPHY(POINT)`     |

### projects

| Column        | Details                              |
|---------------|--------------------------------------|
| `description` | Project description                  |
| `started_at`  | Start timestamp                      |
| `finished_at` | End timestamp                        |
| `status`      | Current project status               |

### books

| Column     | Details                         |
|------------|---------------------------------|
| `title`    | Book title                      |
| `author`   | Book author                     |
| `isbn`     | ISBN identifier                 |
| `pages`    | Total page count                |

These tables follow the same node-plus-child-record design but are not exposed through their own domain CRUD module.

---

## Quick Reference — Node Type Codes

| Entity    | Type Code | Child Table | Primary Filter Column |
|-----------|-----------|-------------|-----------------------|
| Dreams    | `dream`   | `dreams`    | `dream_date`          |
| Thoughts  | `thought` | `thoughts`  | `created_at`          |
| Memories  | `memory`  | `memories`  | `event_date`          |
| Plans     | `plan`    | `plans`     | `deadline`            |
| Actions   | `action`  | `actions`   | `started_at`          |
| People    | `person`  | `people`    | `full_name`           |