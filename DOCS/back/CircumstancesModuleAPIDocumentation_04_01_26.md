# Circumstances Module API Documentation

Base path: `/api/v1/circumstances`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить все обстоятельства с фильтрацией и пагинацией.

**Query Parameters:**
```
page?: number (default: 1)
limit?: number (default: 50)
from?: string (ISO datetime, фильтр от даты)
to?: string (ISO datetime, фильтр до даты)
weather?: 'sunny' | 'rainy' | 'snowy' | 'stormy' | 'cloudy' | 'foggy' | 'windy'
moon_phase?: 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent'
has_global_event?: boolean (true/false - есть ли глобальное событие)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "circumstances": [
      {
        "id": 1,
        "user_id": 1,
        "timestamp": "2025-01-04T10:00:00Z",
        "weather": "rainy",
        "temperature": 15,
        "moon_phase": "full_moon",
        "global_event": "Solar eclipse",
        "notes": "Unusual weather patterns",
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
- Все поля обстоятельств опциональны

---

## GET /:id

Получить обстоятельство по ID.

**Path Parameters:**
- `id`: integer, ID обстоятельства

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T10:00:00Z",
    "weather": "rainy",
    "temperature": 15,
    "moon_phase": "full_moon",
    "global_event": "Solar eclipse",
    "notes": "Unusual weather patterns",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Invalid ID format
404 - Circumstance not found

---

## POST /

Создать новое обстоятельство.

**Request Body:**
```json
{
  "timestamp": "2025-01-04T10:00:00Z",
  "weather": "rainy",
  "temperature": 15,
  "moon_phase": "full_moon",
  "global_event": "Solar eclipse",
  "notes": "Unusual weather patterns"
}
```

**Validation:**
- `timestamp`: опционально, ISO datetime (default: NOW())
- `weather`: опционально, enum: 'sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy'
- `temperature`: опционально, integer -50 до 60 (Celsius)
- `moon_phase`: опционально, enum: 'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
- `global_event`: опционально, string max 500 символов
- `notes`: опционально, string

**Business Rules:**
- Все поля опциональны
- Хотя бы одно поле (кроме timestamp) должно быть заполнено
- Temperature в пределах -50 до +60 по Цельсию

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T10:00:00Z",
    "weather": "rainy",
    "temperature": 15,
    "moon_phase": "full_moon",
    "global_event": "Solar eclipse",
    "notes": "Unusual weather patterns",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "temperature must be between -50 and 60 Celsius"
}
```

400 - No data provided:
```json
{
  "success": false,
  "error": "At least one circumstance field must be provided"
}
```

---

## PUT /:id

Обновить обстоятельство.

**Path Parameters:**
- `id`: integer, ID обстоятельства

**Request Body:**
```json
{
  "timestamp": "2025-01-04T11:00:00Z",
  "weather": "sunny",
  "temperature": 20,
  "moon_phase": "waning_gibbous",
  "global_event": null,
  "notes": "Weather cleared up"
}
```

**Validation:**
- Все поля опциональны
- Валидация аналогична POST

**Allowed fields for update:**
- timestamp
- weather
- temperature
- moon_phase
- global_event
- notes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "timestamp": "2025-01-04T11:00:00Z",
    "weather": "sunny",
    "temperature": 20,
    "moon_phase": "waning_gibbous",
    "global_event": null,
    "notes": "Weather cleared up",
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
404 - Circumstance not found

---

## DELETE /:id

Удалить обстоятельство.

**Path Parameters:**
- `id`: integer, ID обстоятельства

**Success Response (200):**
```json
{
  "success": true,
  "message": "Circumstance deleted successfully"
}
```

**Notes:**
- Если обстоятельство используется в entries или body_states, может потребоваться дополнительная проверка

**Error Responses:**

400 - Invalid ID format
404 - Circumstance not found

---

## GET /stats/weather

Получить статистику по погоде.

**Query Parameters:**
```
from?: string (ISO datetime)
to?: string (ISO datetime)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "weather": "rainy",
      "count": 45,
      "avg_temperature": 14.5
    },
    {
      "weather": "sunny",
      "count": 30,
      "avg_temperature": 22.3
    }
  ]
}
```

**Notes:**
- Показывает только записи, где weather IS NOT NULL
- Отсортировано по count DESC
- avg_temperature - средняя температура для данного типа погоды

---

## GET /stats/moon-phase

Получить статистику по фазам луны.

**Query Parameters:**
```
from?: string (ISO datetime)
to?: string (ISO datetime)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "moon_phase": "full_moon",
      "count": 12
    },
    {
      "moon_phase": "new_moon",
      "count": 11
    }
  ]
}
```

**Notes:**
- Показывает только записи, где moon_phase IS NOT NULL
- Отсортировано по count DESC
- Полезно для анализа влияния фаз луны на состояние

---

## Дополнительные методы (в сервисе)

### findNearestByTimestamp

Найти ближайшее обстоятельство к указанному времени.

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
  "weather": "rainy",
  "temperature": 15,
  "moon_phase": "full_moon",
  "global_event": "Solar eclipse",
  "notes": "Unusual weather patterns",
  "time_diff": 120
}
```

**Notes:**
- `time_diff` - разница в секундах между запрошенным временем и найденным обстоятельством
- Ищется по минимальной разнице по времени (ABS)

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Пользователь может работать только со своими обстоятельствами (проверка user_id)
- **Категории обстоятельств:**
  - **Природные (неуправляемые):** weather, temperature, moon_phase
  - **Глобальные события:** global_event (расширяемое текстовое поле)
  - **Произвольные:** notes
- **Weather types (7):**
  - `sunny` - солнечно
  - `rainy` - дождливо
  - `snowy` - снежно
  - `stormy` - шторм
  - `cloudy` - облачно
  - `foggy` - туманно
  - `windy` - ветрено
- **Moon phases (8):**
  - `new_moon` - новолуние
  - `waxing_crescent` - растущий серп
  - `first_quarter` - первая четверть
  - `waxing_gibbous` - растущая луна
  - `full_moon` - полнолуние
  - `waning_gibbous` - убывающая луна
  - `last_quarter` - последняя четверть
  - `waning_crescent` - убывающий серп
- **Temperature:** диапазон -50°C до +60°C
- **Global event:** произвольное текстовое поле до 500 символов (для записи важных мировых событий, праздников и т.д.)
- Timestamp по умолчанию устанавливается в NOW() при создании
- Можно создать обстоятельство только с notes (без погоды и луны)
- Сортировка по timestamp DESC
- Фильтр has_global_event позволяет найти обстоятельства с/без глобальных событий
- Обстоятельства могут быть связаны с entries (через circumstance_id) и body_states (через circumstance_id)
- Статистика полезна для анализа корреляций между погодой/луной и состоянием/событиями