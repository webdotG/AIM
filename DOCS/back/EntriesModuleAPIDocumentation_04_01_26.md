# Entries Module API Documentation

Base path: `/api/v1/entries`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить список записей с фильтрацией и пагинацией.

**Query Parameters:**
```
type?: 'dream' | 'memory' | 'thought' | 'plan'
page?: number (default: 1)
limit?: number (default: 50)
search?: string (полнотекстовый поиск по content)
from?: string (ISO datetime, фильтр от даты)
to?: string (ISO datetime, фильтр до даты)
body_state_id?: number
circumstance_id?: number
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "user_id": 1,
        "entry_type": "dream",
        "content": "string",
        "body_state_id": 1,
        "circumstance_id": 2,
        "deadline": null,
        "is_completed": false,
        "created_at": "2025-01-04T10:00:00Z",
        "updated_at": "2025-01-04T10:00:00Z"
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

---

## GET /:id

Получить запись по ID.

**Path Parameters:**
- `id`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": 1,
    "entry_type": "dream",
    "content": "string",
    "body_state_id": 1,
    "circumstance_id": 2,
    "deadline": null,
    "is_completed": false,
    "created_at": "2025-01-04T10:00:00Z",
    "updated_at": "2025-01-04T10:00:00Z",
    "emotions": [
      {
        "id": 1,
        "name": "joy",
        "intensity": 8
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "important"
      }
    ],
    "people": [
      {
        "id": 1,
        "name": "John",
        "role": "friend"
      }
    ]
  }
}
```

**Error Responses:**

400 - Invalid ID format:
```json
{
  "success": false,
  "error": "Invalid entry ID format"
}
```

403 - Access denied:
```json
{
  "success": false,
  "error": "Access denied"
}
```

404 - Not found:
```json
{
  "success": false,
  "error": "Entry not found"
}
```

---

## POST /

Создать новую запись.

**Request Body:**
```json
{
  "entry_type": "dream",
  "content": "string (required, min 1 char)",
  "body_state_id": 1,
  "circumstance_id": 2,
  "deadline": "2025-12-31",
  "is_completed": false,
  "emotions": [
    {
      "emotion_id": 1,
      "intensity": 8
    }
  ],
  "people": [
    {
      "person_id": 1,
      "role": "friend"
    }
  ],
  "tags": [1, 2, 3]
}
```

**Validation:**
- `entry_type`: обязательно, одно из: 'dream', 'memory', 'thought', 'plan'
- `content`: обязательно, минимум 1 символ (trim)
- `body_state_id`: опционально, positive integer или null
- `circumstance_id`: опционально, positive integer или null
- `deadline`: **обязательно для entry_type='plan'**, формат YYYY-MM-DD
- `is_completed`: опционально, boolean (default: false)
- `emotions`: опционально, массив объектов с emotion_id и intensity (1-10)
- `people`: опционально, массив объектов с person_id и role
- `tags`: опционально, массив positive integers

**Business Rules:**
- Если entry_type='plan', deadline обязателен
- body_state_id должен существовать в таблице body_states (если указан)
- circumstance_id должен существовать в таблице circumstances (если указан)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": 1,
    "entry_type": "dream",
    "content": "string",
    "body_state_id": 1,
    "circumstance_id": 2,
    "deadline": "2025-12-31",
    "is_completed": false,
    "created_at": "2025-01-04T10:00:00Z",
    "updated_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "error": "Validation error",
  "details": []
}
```

400 - Missing deadline for plan:
```json
{
  "success": false,
  "error": "Plan must have a deadline"
}
```

400 - Invalid entry type:
```json
{
  "success": false,
  "error": "Invalid entry type. Must be one of: dream, memory, thought, plan"
}
```

---

## PUT /:id

Обновить запись.

**Path Parameters:**
- `id`: UUID записи

**Request Body:**
```json
{
  "content": "string",
  "body_state_id": 1,
  "circumstance_id": 2,
  "deadline": "2025-12-31",
  "is_completed": true
}
```

**Validation:**
- Все поля опциональны
- `content`: минимум 1 символ если указан
- `body_state_id`: positive integer или null
- `circumstance_id`: positive integer или null
- `deadline`: формат YYYY-MM-DD
- `is_completed`: boolean

**Allowed fields for update:**
- content
- body_state_id
- circumstance_id
- deadline
- is_completed
- updated_at (автоматически устанавливается в NOW())

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": 1,
    "entry_type": "dream",
    "content": "updated content",
    "body_state_id": 1,
    "circumstance_id": 2,
    "deadline": "2025-12-31",
    "is_completed": true,
    "created_at": "2025-01-04T10:00:00Z",
    "updated_at": "2025-01-04T11:00:00Z"
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
403 - Access denied
404 - Entry not found

---

## DELETE /:id

Удалить запись.

**Path Parameters:**
- `id`: UUID записи

**Success Response (204):**
Пустое тело ответа.

**Error Responses:**

400 - Invalid ID format
403 - Access denied
404 - Entry not found

---

## POST /:id/emotions

Добавить эмоцию к записи.

**Path Parameters:**
- `id`: UUID записи

**Request Body:**
```json
{
  "emotion_id": 1,
  "intensity": 8
}
```

**Validation:**
- `emotion_id`: обязательно, positive integer
- `intensity`: обязательно, integer от 1 до 10

**Business Rules:**
- Проверяется существование записи и права доступа (user_id)
- Проверяется существование emotion_id в таблице emotions
- Эмоция должна существовать в справочнике (27 предопределённых эмоций)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "entry_id": "uuid",
    "emotion_id": 1,
    "intensity": 8
  }
}
```

**Error Responses:**

400 - Invalid entry ID или validation error
403 - Access denied
404 - Entry not found:
```json
{
  "success": false,
  "error": "Entry not found"
}
```

404 - Emotion not found:
```json
{
  "success": false,
  "error": "Emotion not found"
}
```

---

## POST /:id/tags

Добавить тег к записи.

**Path Parameters:**
- `id`: UUID записи

**Request Body:**
```json
{
  "tag_id": 1
}
```

**Validation:**
- `tag_id`: обязательно, positive integer

**Business Rules:**
- Проверяется существование записи и права доступа (user_id)
- Проверяется существование тега И что он принадлежит пользователю
- ON CONFLICT DO NOTHING - повторное добавление игнорируется

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "entry_id": "uuid",
    "tag_id": 1
  }
}
```

**Error Responses:**

400 - Invalid entry ID или validation error
403 - Access denied to entry
404 - Entry not found
404 - Tag not found or access denied:
```json
{
  "success": false,
  "error": "Tag not found or access denied"
}
```

---

## POST /:id/people

Добавить человека к записи.

**Path Parameters:**
- `id`: UUID записи

**Request Body:**
```json
{
  "person_id": 1,
  "role": "friend"
}
```

**Validation:**
- `person_id`: обязательно, positive integer
- `role`: опционально, string (max 50 символов)

**Business Rules:**
- Проверяется существование записи и права доступа (user_id)
- Проверяется существование человека И что он принадлежит пользователю
- ON CONFLICT (entry_id, person_id) DO UPDATE - если связь существует, обновляется role

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "entry_id": "uuid",
    "person_id": 1,
    "role": "friend",
    "notes": null
  }
}
```

**Error Responses:**

400 - Invalid entry ID или validation error
403 - Access denied to entry
404 - Entry not found
404 - Person not found or access denied:
```json
{
  "success": false,
  "error": "Person not found or access denied"
}
```

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Пользователь может работать только со своими записями (проверка user_id)
- При создании записи можно одновременно добавить emotions, tags, people через массивы
- Полнотекстовый поиск работает с русским языком (to_tsvector('russian'))
- Записи сортируются по created_at DESC
- Entry ID - UUID формат
- Поля deadline и is_completed используются только для entry_type='plan'
- **ВАЖНО**: Для entry_type='plan' поле deadline обязательно при создании
- Tags и People должны принадлежать пользователю (проверка user_id)
- Emotions берутся из общего справочника (27 эмоций)
- При GET /:id возвращается запись со всеми связанными emotions, tags, people