# Module 7: Measurements

## Overview

The Measurements module provides quantitative measurement capabilities on nodes. Measurements are tied to `measurement_definitions` that specify data type, units, and constraints. Four value types are supported: integer, decimal, boolean, and text — exactly one must be provided per measurement.

**Location:** `src/modules/measurements/`

---

## Architecture

```
Request → MeasurementsController → MeasurementsService → MeasurementsRepository → PostgreSQL
                                      ↓
                               NodesRepository (ownership check)
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `MeasurementsController` | `controllers/MeasurementsController.ts` | HTTP handlers — create, read, delete |
| `MeasurementsService` | `services/MeasurementsService.ts` | Ownership validation, single-value enforcement |
| `MeasurementsRepository` | `repositories/MeasurementsRepository.ts` | DB queries — INSERT, SELECT with join, DELETE |

---

## Database Tables

### `measurement_definitions` — Reference table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PK, SERIAL |
| `code` | VARCHAR | UNIQUE |
| `name` | VARCHAR | Display name |
| `description` | TEXT | Optional description |
| `data_type` | VARCHAR | `integer`, `decimal`, `boolean`, `text` |
| `default_unit` | VARCHAR | Optional (e.g., `kg`, `cm`, `%`) |
| `min_value` | NUMERIC | Optional lower bound |
| `max_value` | NUMERIC | Optional upper bound |

### `activity_measurements` — Available measurements per activity

| Column | Type | Constraints |
|--------|------|-------------|
| `activity_id` | INT | FK → activities |
| `measurement_id` | INT | FK → `measurement_definitions.id` |

**Primary key:** Composite `(activity_id, measurement_id)` — defines which measurements are available for which activity type.

### `node_measurements` — Actual measurements on nodes

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PK, SERIAL |
| `node_id` | UUID | FK → `nodes.id` |
| `measurement_id` | INT | FK → `measurement_definitions.id` |
| `value_integer` | INT | NULL allowed |
| `value_decimal` | NUMERIC | NULL allowed |
| `value_boolean` | BOOLEAN | NULL allowed |
| `value_text` | TEXT | NULL allowed |
| `unit` | VARCHAR | Optional override for default_unit |
| `measured_at` | TIMESTAMPTZ | DEFAULT NOW() |

**CHECK constraint:** Exactly one of `value_integer`, `value_decimal`, `value_boolean`, `value_text` must be NOT NULL. Enforced at the DB level and at the application level.

### `characteristic_rules` — Derivation rules
Defines rules for deriving characteristics from activities/measurements. Used for computed properties.

---

## Validation

### Single-value enforcement (application level)
`MeasurementsService.createMeasurement` counts non-null/non-undefined value fields and throws `ValidationError` if the count is not exactly 1:

```typescript
const valueCount = [input.value_integer, input.value_decimal, input.value_boolean, input.value_text]
  .filter(v => v !== undefined && v !== null).length;
if (valueCount !== 1) {
  throw new ValidationError('Exactly one value field must be provided');
}
```

### Ownership validation
Every endpoint verifies `nodesRepo.belongsToUser(nodeId, userId)` before operating on the node.

---

## Endpoints

All routes require authentication via `authenticate` middleware.

| Method | Path | Controller | Service | Description |
|--------|------|-----------|---------|-------------|
| POST | `/node/:nodeId` | `createMeasurement` | `createMeasurement()` | Record a measurement |
| GET | `/node/:nodeId` | `getMeasurements` | `getMeasurements()` | Get all measurements |
| DELETE | `/node/:nodeId` | `deleteMeasurements` | `deleteMeasurements()` | Remove all measurements |

### `POST /node/:nodeId` — Create
**Request body:**
```json
{
  "measurement_id": 1,
  "value_integer": 75,
  "unit": "kg"
}
```
Only one value field should be provided. Returns the created measurement row with `measured_at` timestamp and `id`.

### `GET /node/:nodeId` — Read
Returns all measurements for a node, JOINed with `measurement_definitions` to include `measurement_code`, `measurement_name`, and `data_type`. Ordered by `measured_at DESC`.

### `DELETE /node/:nodeId` — Delete
Removes all measurements for a node. Returns `{ removed: <count> }`.

---

## Repository Query Patterns

### `MeasurementsRepository.create(nodeId, input)`
INSERT with all four value fields (passed as `input.<field> ?? null`), RETURNING *.

### `MeasurementsRepository.findByNodeId(nodeId)`
Joins `node_measurements` → `measurement_definitions` on `measurement_id`, filters by `node_id`, orders by `measured_at DESC`. Includes `measurement_code`, `measurement_name`, `data_type` in result.

### `MeasurementsRepository.deleteByNodeId(nodeId)`
DELETE with `node_id` filter, returns `rowCount` (or 0).

---

## Design Notes

1. **Sparse value columns:** The four value columns allow a single table to store any data type. The CHECK constraint at the DB level ensures correctness.

2. **No update endpoint:** Measurements follow the "facts are immutable" principle — to change a measurement, record a new one with a different `measured_at` timestamp.

3. **Bulk delete:** The DELETE endpoint removes all measurements for a node at once, returning the count of removed rows.

4. **Activity binding:** `activity_measurements` table controls which measurement definitions are available for which activity types, providing a catalog before recording. 5. **Characteristic rules:** The `characteristic_rules` table enables deriving higher-level characteristics from raw measurement data.