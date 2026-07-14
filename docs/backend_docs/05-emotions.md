# Module 5: Emotions

## Overview

The Emotions module implements the Berkeley emotion model with 26 predefined emotions categorized as positive, negative, or neutral. Each node in the graph can have multiple emotions attached with an intensity value from 1 to 10.

**Location:** `src/modules/emotions/`

---

## Architecture

```
Request → EmotionsController → EmotionsService → EmotionsRepository / NodeEmotionsRepository → PostgreSQL
                                      ↓
                               NodesRepository (ownership check)
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `EmotionsController` | `controllers/EmotionsController.ts` | HTTP handlers, request/response mapping |
| `EmotionsService` | `services/EmotionsService.ts` | Business logic, ownership validation, intensity validation |
| `EmotionsRepository` | `repositories/EmotionsRepository.ts` | Reference lookup — all emotions, by category, by ID |
| `NodeEmotionsRepository` | `repositories/NodeEmotionsRepository.ts` | Node-emotion mapping CRUD, statistics, distribution |
| `emotion.schema.ts` | `schemas/emotion.schema.ts` | Zod validation schemas |

---

## Database Tables

### `emotions` — Reference table (predefined, not user-generated)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PK, SERIAL |
| `code` | VARCHAR | UNIQUE (e.g., `joy`, `sadness`, `anger`) |
| `name_ru` | VARCHAR | Russian name |
| `name_en` | VARCHAR | English name |
| `category` | VARCHAR | `positive`, `negative`, or `neutral` |

Contains 26 predefined emotions based on the Berkeley model.

### `node_emotions` — Mapping table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PK, SERIAL |
| `node_id` | UUID | FK → `nodes.id` |
| `emotion_id` | INT | FK → `emotions.id` |
| `intensity` | INT | CHECK (1-10) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Unique constraint:** `UNIQUE(node_id, emotion_id)` — a node can have each emotion at most once.

---

## Validation Schemas

### `attachEmotionsSchema`
Validates `emotions` array in request body. Each item requires `emotion_id` or `emotion_category` plus `intensity` (1-10).

### `emotionCategorySchema`
Validates `:category` parameter as one of `positive`, `negative`, `neutral`.

### `emotionStatsSchema`
Query params: `start_date`, `end_date`, `min_intensity` (default 1).

### `mostFrequentSchema`
Query params: `limit` (default 10), `start_date`, `end_date`.

### `distributionSchema`
Query params: `group_by` (`category`/`intensity`/`month`, default `category`), `start_date`, `end_date`.

### `timelineSchema`
Query params: `emotion_id`, `category`, `start_date`, `end_date`.

---

## Endpoints

### Public (no auth)

| Method | Path | Controller | Service |
|--------|------|-----------|---------|
| GET | `/` | `getAll` | `getAllEmotions()` → `findAll()` |
| GET | `/category/:category` | `getByCategory` | `getByCategory()` → `findByCategory()` |

`getByCategory` validates the category parameter is one of `positive`, `negative`, `neutral` before querying.

### Authenticated

| Method | Path | Controller | Service | Description |
|--------|------|-----------|---------|-------------|
| GET | `/node/:nodeId` | `getEmotionsForNode` | `getEmotionsForNode()` | Emotions for a node |
| PUT | `/node/:nodeId` | `replaceEmotionsForNode` | `replaceEmotionsForNode()` | Replace all emotions |
| DELETE | `/node/:nodeId` | `removeEmotionsFromNode` | `removeEmotionsFromNode()` | Remove all emotions |
| GET | `/stats` | `getStats` | `getStats()` | Overall emotion stats |
| GET | `/most-frequent` | `getMostFrequent` | `getMostFrequent()` | Top N emotions by frequency |
| GET | `/distribution` | `getDistribution` | `getDistribution()` | Distribution over time |

**Ownership gate:** All authenticated endpoints verify `nodesRepo.belongsToUser(nodeId, userId)` before operating.

**`replaceEmotionsForNode` workflow:**
1. Validate node ownership
2. Validate each emotion's intensity (1-10) and existence in `emotions` table
3. Execute in transaction: DELETE all → INSERT each

**`getDistribution` parameters:** `granularity` query param accepts `day`, `week`, or `month`. Uses `date_trunc()` for week/month grouping. Returns `period`, `emotion_category`, `occurrence_count`, `avg_intensity`.

**`getMostFrequent` parameters:** `limit` query param (default 10). Returns `emotion_id`, `emotion_code`, `name_ru`, `name_en`, `category`, `occurrence_count`, `avg_intensity`.

---

## Repository Query Patterns

### `NodeEmotionsRepository.getMostFrequent(userId, limit)`
Joins `node_emotions` → `nodes` → `emotions`, filters by `user_id` and `deleted_at IS NULL`, groups by emotion, orders by count descending, applies limit.

### `NodeEmotionsRepository.getDistribution(userId, granularity)`
Same joins, groups by time period + category, returns per-period counts and average intensities.

### `NodeEmotionsRepository.replaceForNode(nodeId, emotions[])`
Uses a transaction (BEGIN/DELETE/INSERT loop/COMMIT) with full ROLLBACK on error and `client.release()` in finally.