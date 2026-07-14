# Database Overview

## PostgreSQL 16 + PostGIS

AIM использует **графовую модель** данных в PostgreSQL. Все сущности — узлы графа, любые два узла можно связать ребром.

## Таблицы (23)

### Core graph (5 tables)

| Table | PK | Purpose |
|-------|----|---------|
| `users` | SERIAL | Accounts: login, password_hash, backup_code_hash |
| `nodes` | UUID | Graph nodes: user_id, node_type_id, title, timestamps |
| `edges` | BIGSERIAL | Graph edges: from/to, edge_type, confidence, weight |
| `node_types` | SERIAL | Reference: 16 types (dream, thought, memory...) |
| `edge_types` | SERIAL | Reference: 16 edge types (caused, mentions...) |

### Entity tables (9 tables)

| Table | Node type | Special fields |
|-------|-----------|----------------|
| `dreams` | dream | content, dream_date, lucidity, vividness, nightmare, sleep_start/end |
| `thoughts` | thought | content, importance, confidence |
| `memories` | memory | content, event_date, confidence |
| `plans` | plan | description, deadline, priority, completed, completed_at |
| `actions` | action | activity_id, started_at, finished_at, description |
| `people` | person | full_name, nickname, birth_date, relationship, notes |
| `places` | place | title, address, location (PostGIS POINT) |
| `projects` | project | description, started_at, finished_at, status |
| `books` | book | title, author, isbn, pages |

### Metadata (7 tables)

| Table | Purpose |
|-------|---------|
| `emotions` | 26 Berkeley emotions (positive/negative/neutral) |
| `node_emotions` | Node→emotion mapping with intensity (1-10) |
| `tags` | User-defined tags |
| `node_tags` | Node→tag mapping (many-to-many) |
| `activities` | Hierarchical activity catalog |
| `measurement_definitions` | Measurement type definitions (int/decimal/bool/text) |
| `activity_measurements` | Activity→measurement binding |
| `node_measurements` | Sparse values: one of value_integer/value_decimal/value_boolean/value_text |
| `characteristics` | User characteristic definitions |
| `characteristic_rules` | Computation rules for characteristics |

### AI + Analytics (2 tables)

| Table | Purpose | Note |
|-------|---------|------|
| `ai_analysis` | AI analysis results | `ON DELETE RESTRICT` |
| `ai_images` | AI-generated images | `ON DELETE RESTRICT` |

## Node types (16)

```
dream, thought, memory, action, person, place, book, project,
conversation, movie, course, website, music, article, plan
```

## Edge types (16)

```
mentions, caused, resulted_in, inspired, reminded_of, about,
contains, performed_with, completed_by, created, references,
symbolizes, contradicts, depends_on, belongs_to, related_to
```

## Triggers (3)

| Trigger | Table | Purpose |
|---------|-------|---------|
| `prevent_node_hard_delete` | nodes | All deletes must use `UPDATE deleted_at = NOW()` |
| `check_node_type_consistency` | nodes | Node type ↔ child table record |
| `check_measurement_type` | node_measurements | Value type must match definition |

## Indexes

Partial indexes optimisere their former `deleted_at IS NULL$:
- `idx_nodes_user` — user_id WHERE deleted_at IS NULL
- `idx_nodes_type` — node_type_id WHERE deleted_at IS NULL
- `idx_nodes_created` — created_at WHERE deleted_at IS NULL
- `idx_edges_from` — from_node_id WHERE deleted_at IS NULL
- `idx_edges_to` — to_node_id WHERE deleted_at IS NULL
- `idx_edges_type` — edge_type_id WHERE deleted_at IS NULL

Plus node-specific indexes for all entity tables.

## Data flow

```
API Request
    ↓
Controller → Service
    ↓
Repository → SQL → PostgreSQL
    ↓
Node + Child table (atomic transaction)
    ↓
Optional: Edge creation, emotions, tags, measurements
```

## Constraints

- **CASCADE**: Most tables cascade delete from users
- **RESTRICT**: `ai_analysis` and `ai_images` survive node deletion (facts of generation)
- **CHECK**: `confidence` (0-1), `weight` (≥0), `from_node_id <> to_node_id`
- **UNIQUE**: `login`, `backup_code_hash`, node_type code, emotion code, edge_type code, node_emotions (node_id, emotion_id)