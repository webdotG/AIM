# Relations Module API Documentation

Base path: `/api/v1/relations`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /types

Получить справочник типов связей.

**Authentication:** Требуется JWT токен

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "led_to",
      "description": "Привело к",
      "direction": "forward"
    },
    {
      "name": "reminded_of",
      "description": "Напомнило о",
      "direction": "backward"
    },
    {
      "name": "inspired_by",
      "description": "Вдохновлено",
      "direction": "backward"
    },
    {
      "name": "caused_by",
      "description": "Вызвано",
      "direction": "backward"
    },
    {
      "name": "related_to",
      "description": "Связано с",
      "direction": "both"
    },
    {
      "name": "resulted_in",
      "description": "Привело к результату",
      "direction": "forward"
    }
  ]
}
```

**Notes:**
- Типы связей хардкодятся в CHECK constraint БД
- Direction указывает семантику связи (forward/backward/both)

---

## GET /entry/:entryId

Получить все связи для записи (входящие и исходящие).

**Path Parameters:**
- `entryId`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "incoming": [
      {
        "id": 1,
        "from_entry_id": "uuid-1",
        "to_entry_id": "uuid-current",
        "relation_type": "led_to",
        "description": "Dream led to this memory",
        "from_content": "I dreamed about...",
        "from_type": "dream",
        "from_created_at": "2025-01-03T10:00:00Z",
        "to_content": "Current entry content",
        "to_type": "memory",
        "to_created_at": "2025-01-04T10:00:00Z",
        "created_at": "2025-01-04T10:00:00Z"
      }
    ],
    "outgoing": [
      {
        "id": 2,
        "from_entry_id": "uuid-current",
        "to_entry_id": "uuid-2",
        "relation_type": "inspired_by",
        "description": null,
        "from_content": "Current entry content",
        "from_type": "memory",
        "from_created_at": "2025-01-04T10:00:00Z",
        "to_content": "Another entry...",
        "to_type": "thought",
        "to_created_at": "2025-01-05T10:00:00Z",
        "created_at": "2025-01-04T11:00:00Z"
      }
    ]
  }
}
```

**Notes:**
- Incoming - связи, где текущая запись является to_entry_id
- Outgoing - связи, где текущая запись является from_entry_id
- Включает краткую информацию о связанных записях
- Отсортировано по created_at DESC

**Error Responses:**

400 - Invalid UUID
404 - Entry not found

---

## POST /

Создать связь между записями.

**Request Body:**
```json
{
  "from_entry_id": "uuid-1",
  "to_entry_id": "uuid-2",
  "relation_type": "led_to",
  "description": "Optional description"
}
```

**Validation:**
- `from_entry_id`: обязательно, UUID
- `to_entry_id`: обязательно, UUID
- `relation_type`: обязательно, одно из: 'led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in'
- `description`: опционально, string max 500 символов
- from_entry_id не может быть равен to_entry_id

**Business Rules:**
- Обе записи должны принадлежать пользователю
- Проверяется существование обеих записей
- Проверяется наличие циклов в графе (но циклы разрешены с предупреждением)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_entry_id": "uuid-1",
    "to_entry_id": "uuid-2",
    "relation_type": "led_to",
    "description": "Optional description",
    "created_at": "2025-01-04T10:00:00Z",
    "has_cycle": false
  },
  "warning": null
}
```

**Success Response with cycle (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_entry_id": "uuid-1",
    "to_entry_id": "uuid-2",
    "relation_type": "led_to",
    "description": null,
    "created_at": "2025-01-04T10:00:00Z",
    "has_cycle": true
  },
  "warning": "Cycle detected in the graph"
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "Entry cannot be related to itself"
}
```

400 - Invalid UUID
404 - From entry not found:
```json
{
  "success": false,
  "error": "From entry not found"
}
```

404 - To entry not found:
```json
{
  "success": false,
  "error": "To entry not found"
}
```

---

## DELETE /:id

Удалить связь.

**Path Parameters:**
- `id`: integer, ID связи

**Success Response (200):**
```json
{
  "success": true,
  "message": "Relation deleted successfully"
}
```

**Notes:**
- Проверяется, что from_entry принадлежит пользователю
- Только владелец from_entry может удалить связь

**Error Responses:**

400 - Invalid ID format
404 - Relation not found

---

## GET /chain/:entryId

Получить цепочку связей (граф) через рекурсивный CTE.

**Path Parameters:**
- `entryId`: UUID записи (начальная точка)

**Query Parameters:**
```
depth?: number (default: 10, max глубина рекурсии)
direction?: 'forward' | 'backward' | 'both' (default: 'both')
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "chain": [
      {
        "id": "uuid-1",
        "entry_type": "dream",
        "content": "I dreamed about...",
        "created_at": "2025-01-03T10:00:00Z",
        "depth": 0,
        "relation_type": null,
        "path": ["uuid-1"]
      },
      {
        "id": "uuid-2",
        "entry_type": "memory",
        "content": "This reminded me...",
        "created_at": "2025-01-04T10:00:00Z",
        "depth": 1,
        "relation_type": "led_to",
        "path": ["uuid-1", "uuid-2"]
      }
    ],
    "total_depth": 1,
    "entry_count": 2
  }
}
```

**Notes:**
- **forward** - идёт по связям from -> to
- **backward** - идёт по связям to -> from
- **both** - комбинирует оба направления
- Предотвращает циклы через проверку path (NOT IN)
- depth начинается с 0 для исходной записи
- Отсортировано по depth ASC

**Error Responses:**

400 - Invalid UUID
404 - Entry not found

---

## GET /most-connected

Получить самые связанные записи пользователя.

**Query Parameters:**
```
limit?: number (default: 10)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "entry_type": "dream",
      "content": "Highly connected entry...",
      "created_at": "2025-01-03T10:00:00Z",
      "outgoing_count": 5,
      "incoming_count": 3,
      "total_connections": 8
    }
  ]
}
```

**Notes:**
- outgoing_count - количество исходящих связей (from_entry_id)
- incoming_count - количество входящих связей (to_entry_id)
- total_connections - сумма обоих
- Отсортировано по total_connections DESC
- Показывает только записи с хотя бы одной связью

---

## GET /graph

Получить данные для визуализации графа (nodes + edges).

**Query Parameters:**
```
entryId?: string (UUID, опционально - фильтр по записи)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "uuid-1",
        "content": "Entry content...",
        "type": "dream"
      },
      {
        "id": "uuid-2",
        "content": "Another entry...",
        "type": "memory"
      }
    ],
    "edges": [
      {
        "id": 1,
        "from": "uuid-1",
        "to": "uuid-2",
        "relation_type": "led_to",
        "description": "Dream led to memory"
      }
    ]
  }
}
```

**Notes:**
- Если entryId указан, возвращаются только связи с участием этой записи
- Если entryId не указан, возвращается весь граф пользователя
- nodes - уникальные записи (дедуплицированы)
- edges - связи между записями
- Формат готов для визуализации в D3.js, vis.js и т.д.

**Error Responses:**

400 - Invalid UUID (если entryId указан)
404 - Entry not found (если entryId указан)

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Связи направленные (from_entry_id -> to_entry_id)
- **Циклы разрешены** - система предупреждает, но не блокирует создание циклических связей
- Пользователь может создавать связи только между своими записями
- Связь можно удалить только если from_entry принадлежит пользователю
- **Рекурсивный CTE** используется для построения цепочек с защитой от бесконечных циклов
- **Типы связей** (6 типов):
  - `led_to` - причинно-следственная связь вперёд
  - `reminded_of` - ассоциативная связь назад
  - `inspired_by` - источник вдохновения
  - `caused_by` - причина события
  - `related_to` - общая связь (двунаправленная)
  - `resulted_in` - результат действия
- Граф можно исследовать в трёх направлениях: forward (по стрелкам), backward (против стрелок), both (в обоих)
- При проверке циклов используется ограничение глубины (20 уровней) для производительности
- Связи включают метаданные о связанных записях для удобства отображения