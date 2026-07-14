# Module 9: Analytics

## Overview

The Analytics module provides statistics and insights endpoints for user data. It aggregates across nodes, edges, emotions, and activities to answer questions about usage patterns, emotional trends, connection density, and engagement streaks. The service layer is a thin pass-through; all complex SQL queries live in the repository.

**Location:** `src/modules/analytics/`

---

## Architecture

```
Request → AnalyticsController → AnalyticsService (thin) → AnalyticsRepository (complex SQL) → PostgreSQL
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `AnalyticsController` | `controllers/AnalyticsController.ts` | HTTP handlers, query param parsing |
| `AnalyticsService` | `services/AnalyticsService.ts` | Thin wrapper — delegates directly to repository |
| `AnalyticsRepository` | `repositories/AnalyticsRepository.ts` | All complex SQL queries with aggregations |
| `analytics.schema.ts` | `schemas/analytics.schema.ts` | Zod validation schemas |

---

## Validation Schemas

| Schema | Query Params |
|--------|-------------|
| `overallStatsSchema` | None (empty object) |
| `entriesByMonthSchema` | `months` (default 12) |
| `emotionDistributionSchema` | `from`, `to` (date strings) |
| `activityHeatmapSchema` | `year` (4-digit, default current year) |
| `streaksSchema` | None (empty object) |

---

## Endpoints

All routes require authentication via `authenticate` middleware.

| Method | Path | Controller | Service | Repository | Description |
|--------|------|-----------|---------|-----------|-------------|
| GET | `/profile` | `getUserProfile` | `getUserProfile()` | Composed | User profile summary |
| GET | `/stats` | `getStats` | `getOverallStats()` | `getOverallStats()` | Node counts by type |
| GET | `/entries-by-month` | `getEntriesByMonth` | `getEntriesByMonth()` | `getEntriesByMonth()` | Entries grouped by month |
| GET | `/emotion-distribution` | `getEmotionDistribution` | `getEmotionDistribution()` | `getEmotionDistribution()` | Emotion category breakdown |
| GET | `/emotion-timeline` | `getEmotionTimeline` | `getEmotionTimeline()` | `getEmotionTimeline()` | Emotion changes over time |
| GET | `/activity-heatmap` | `getActivityHeatmap` | `getActivityHeatmap()` | `getActivityHeatmap()` | Day-level activity grid |
| GET | `/streaks` | `getStreaks` | `getStreaks()` | `getStreaks()` | Consecutive day streaks |
| GET | `/node-connections` | `getNodeConnections` | `getNodeConnections()` | `getNodeConnections()` | Connection statistics |

### Route ordering
`/profile` is defined before `/stats` and other routes to prevent parameter collision in Express Router.

---

## Repository Query Details

### `getOverallStats(userId)`
Joins `nodes` → `node_types`, groups by `nt.code`, returns `{ type: count }` object. Filters: `user_id`, `deleted_at IS NULL`.

### `getEntriesByMonth(userId, months)`
Uses `date_trunc('month', created_at)` for grouping. Time window is `NOW() - INTERVAL '${months} months'`. Returns rows with `month`, `node_type`, `count`, ordered by month ascending.

### `getEmotionDistribution(userId)`
Joins `node_emotions` → `nodes` → `emotions`, groups by `e.category`. Returns `emotion_category`, `occurrence_count`, `avg_intensity` (2 decimal places), `avg_intensity_rounded` (integer).

### `getActivityHeatmap(userId, year)`
Groups `nodes` by `created_at::date` within a specific year. Returns `day`, `count` — designed for GitHub-style contribution heatmaps.

### `getStreaks(userId)`
Complex CTE query:
1. `daily_entries`: DISTINCT dates with node creation
2. `gaps`: LAG to find day gaps between consecutive entries
3. `streaks`: Marks new streak starts when gap > 1
4. Window SUM groups consecutive days

Returns `{ current_streak: <number>, is_current: <boolean> }`. The `is_current` flag compares the streak's last date against the user's latest entry date.

### `getEmotionTimeline(userId, granularity)`
Same JOIN structure as `getEmotionDistribution`, but groups by time period + category. Uses `date_trunc` with configurable granularity (`day`/`week`/`month`). Limited to 100 rows, ordered by period descending. Returns `period`, `emotion_category`, `count`, `avg_intensity`, `avg_intensity_rounded`.

### `getNodeConnections(userId)`
Counts edges per node using LEFT JOINs on `edges` and `edge_types`. Includes `people_contact_count` via a subquery that joins edges to the `people` table. Filters: `user_id`, `deleted_at IS NULL`, `HAVING COUNT(e.id) > 0`. Limited to 50 nodes, ordered by connection count descending.

Returns: `id`, `title`, `node_type_code`, `connection_count`, `edge_types` (array), `people_contact_count`.

### `getUserProfile(userId)` — Composed
Calls `getOverallStats`, `getEmotionDistribution`, and `getStreaks`, then returns a combined object:
```json
{
  "node_stats": { ... },
  "emotion_distribution": [ ... ],
  "streaks": { ... },
  "total_nodes": <number>
}
```

`total_nodes` is computed as `Object.values(stats).reduce(...)`.

---

## Design Notes

1. **Thin service:** `AnalyticsService` has zero business logic — every method simply calls the corresponding repository method. All intelligence lives in the SQL queries.

2. **Soft delete awareness:** Every query filters `n.deleted_at IS NULL` to exclude soft-deleted nodes from statistics.

3. **User isolation:** Every query filters by `user_id` — analytics are strictly per-user.

4. **SQL CTEs:** Complex queries like `getStreaks` use PostgreSQL CTEs (WITH clauses) for readability and intermediate computation.

5. **Numeric precision:** Average intensity values are returned both as rounded (`::int`) and precise (`::numeric, 2 columns) to support different UI use cases.

6. **No caching:** Analytics queries hit the database directly on every request. For high-traffic deployments, consider adding Redis caching at the service layer.

7. **Row limits:** `getEmotionTimeline` (100 rows) and `getNodeConnections` (50 rows) have explicit LIMIT clauses to prevent excessively large responses.