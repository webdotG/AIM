# Body States Module API Documentation

Base path: `/api/v1/body-states`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить список состояний тела с фильтрацией и пагинацией.

**Query Parameters:**
```
page?: number (default: 1)
limit?: number (default: 50)
from?: string (ISO datetime, фильтр от даты)
to?: string (ISO datetime, фильтр до даты)
has_location?: boolean (true/false - есть ли координаты)
circumstance_id?: number
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "body_states": [
      {
        "id": 1,
        "user_id": 1,
        "timestamp": "2025-01-04T10:00:00Z",
        "latitude": 56.9496,
        "longitude": 24.1052,
        "location_name": "Home",
        "location_address": "Riga, Latvia",
        "location_precision": "exact",
        "health_points": 85,
        "energy_points": 70,
        "circumstance_id": 2,
        "created_at": "2025-01-04T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

**Notes:**
- Отсортировано по timestamp DESC
- `latitude` и `longitude` извлекаются из PostGIS GEOGRAPHY type
- Если location_point отсутствует, latitude/longitude будут null

---

## GET /:id

Получить состояние тела по ID.

**Path Parameters:**
- `id`: integer, ID состояния

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T10:00:00Z",
    "latitude": 56.9496,
    "longitude": 24.1052,
    "location_name": "Home",
    "location_address": "Riga, Latvia",
    "location_precision": "exact",
    "health_points": 85,
    "energy_points": 70,
    "circumstance_id": 2,
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Invalid ID format:
```json
{
  "success": false,
  "error": "Invalid ID format"
}
```

404 - Not found:
```json
{
  "success": false,
  "error": "Body state not found"
}
```

---

## POST /

Создать новое состояние тела.

**Request Body:**
```json
{
  "timestamp": "2025-01-04T10:00:00Z",
  "location_point": {
    "latitude": 56.9496,
    "longitude": 24.1052
  },
  "location_name": "Home",
  "location_address": "Riga, Latvia",
  "location_precision": "exact",
  "health_points": 85,
  "energy_points": 70,
  "circumstance_id": 2
}
```

**Validation:**
- `timestamp`: опционально, ISO datetime (default: NOW())
- `location_point`: опционально, объект с latitude и longitude
  - `latitude`: number, -90 до 90
  - `longitude`: number, -180 до 180
- `location_name`: опционально, string max 200 символов
- `location_address`: опционально, string
- `location_precision`: опционально, enum: 'exact' | 'approximate' | 'city' | 'country'
- `health_points`: опционально, integer 0-100
- `energy_points`: опционально, integer 0-100
- `circumstance_id`: опционально, positive integer

**Business Rules:**
- Все поля опциональны - можно создать состояние без данных (только timestamp)
- Если location_point указан, должны быть оба поля: latitude и longitude
- health_points и energy_points должны быть в диапазоне 0-100
- circumstance_id должен существовать в таблице circumstances (если указан)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T10:00:00Z",
    "latitude": 56.9496,
    "longitude": 24.1052,
    "location_name": "Home",
    "location_address": "Riga, Latvia",
    "location_precision": "exact",
    "health_points": 85,
    "energy_points": 70,
    "circumstance_id": 2,
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "error": "health_points must be between 0 and 100"
}
```

400 - Invalid location:
```json
{
  "success": false,
  "error": "location_point must have latitude and longitude"
}
```

---

## PUT /:id

Обновить состояние тела.

**Path Parameters:**
- `id`: integer, ID состояния

**Request Body:**
```json
{
  "timestamp": "2025-01-04T11:00:00Z",
  "location_point": {
    "latitude": 56.9496,
    "longitude": 24.1052
  },
  "location_name": "Office",
  "location_address": "Riga, Latvia",
  "location_precision": "approximate",
  "health_points": 80,
  "energy_points": 65,
  "circumstance_id": 3
}
```

**Validation:**
- Все поля опциональны
- Валидация аналогична POST
- Можно установить location_point = null для удаления координат

**Allowed fields for update:**
- timestamp
- location_point (специальная обработка для PostGIS)
- location_name
- location_address
- location_precision
- health_points
- energy_points
- circumstance_id

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T11:00:00Z",
    "latitude": 56.9496,
    "longitude": 24.1052,
    "location_name": "Office",
    "location_address": "Riga, Latvia",
    "location_precision": "approximate",
    "health_points": 80,
    "energy_points": 65,
    "circumstance_id": 3,
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - No valid fields:
```json
{
  "success": false,
  "error": "No valid fields to update"
}
```

400 - Invalid ID или validation error
404 - Body state not found

---

## DELETE /:id

Удалить состояние тела.

**Path Parameters:**
- `id`: integer, ID состояния

**Success Response (200):**
```json
{
  "success": true,
  "message": "Body state deleted successfully"
}
```

**Error Responses:**

400 - Invalid ID format
404 - Body state not found

---

## Дополнительные методы (в сервисе)

### findNearestByTimestamp

Найти ближайшее состояние тела к указанному времени.

**Internal method** (используется другими сервисами)

```typescript
async findNearestByTimestamp(userId: number, timestamp: Date)
```

**Returns:**
```json
{
  "id": 1,
  "user_id": 1,
  "timestamp": "2025-01-04T10:00:00Z",
  "latitude": 56.9496,
  "longitude": 24.1052,
  "location_name": "Home",
  "health_points": 85,
  "energy_points": 70,
  "circumstance_id": 2,
  "time_diff": 120
}
```

**Notes:**
- `time_diff` - разница в секундах между запрошенным временем и найденным состоянием
- Ищется по минимальной разнице по времени (ABS)

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Пользователь может работать только со своими состояниями (проверка user_id)
- **PostGIS Geography:** location_point хранится как GEOGRAPHY(Point, 4326)
  - При создании/обновлении используется ST_Point(longitude, latitude)
  - При выборке координаты извлекаются через ST_X() и ST_Y()
- **Health Points (HP):** 0-100, показатель здоровья
- **Energy Points:** 0-100, показатель энергии
- **Location precision levels:**
  - `exact` - точные GPS координаты
  - `approximate` - приблизительное местоположение
  - `city` - уровень города
  - `country` - уровень страны
- Timestamp по умолчанию устанавливается в NOW() при создании
- Можно создать состояние без локации (все location поля null)
- Сортировка по timestamp DESC
- Фильтр has_location позволяет найти состояния с/без координат