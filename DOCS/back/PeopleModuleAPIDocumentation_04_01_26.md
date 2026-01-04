# People Module API Documentation

Base path: `/api/v1/people`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить всех людей с фильтрацией и пагинацией.

**Query Parameters:**
```
category?: 'family' | 'friends' | 'acquaintances' | 'strangers'
search?: string (поиск по имени, ILIKE)
sort?: 'name' | 'mentions' | 'created_at' (default: 'name')
page?: number (default: 1)
limit?: number (default: 50)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "people": [
      {
        "id": 1,
        "user_id": 1,
        "name": "John Doe",
        "category": "friends",
        "relationship": "College friend",
        "bio": "Met in university, works in tech",
        "birth_date": "1990-05-15",
        "notes": "Lives in San Francisco",
        "created_at": "2025-01-04T10:00:00Z",
        "mention_count": 15
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
- `mention_count` - количество записей, где упоминается этот человек (через entry_people)
- Сортировка:
  - `name` - по имени по алфавиту (по умолчанию)
  - `mentions` - по количеству упоминаний DESC
  - `created_at` - по дате создания DESC
- Поиск case-insensitive (ILIKE)

---

## GET /:id

Получить человека по ID.

**Path Parameters:**
- `id`: integer, ID человека

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "category": "friends",
    "relationship": "College friend",
    "bio": "Met in university, works in tech",
    "birth_date": "1990-05-15",
    "notes": "Lives in San Francisco",
    "created_at": "2025-01-04T10:00:00Z",
    "mention_count": 15
  }
}
```

**Error Responses:**

400 - Invalid ID format
404 - Person not found

---

## POST /

Создать нового человека.

**Request Body:**
```json
{
  "name": "John Doe",
  "category": "friends",
  "relationship": "College friend",
  "bio": "Met in university, works in tech",
  "birth_date": "1990-05-15",
  "notes": "Lives in San Francisco"
}
```

**Validation:**
- `name`: обязательно, 1-100 символов
- `category`: обязательно, enum: 'family', 'friends', 'acquaintances', 'strangers'
- `relationship`: опционально, max 100 символов (например: "brother", "colleague", "neighbor")
- `bio`: опционально, текст (биография, описание)
- `birth_date`: опционально, ISO date format (YYYY-MM-DD)
- `notes`: опционально, текст (произвольные заметки)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "category": "friends",
    "relationship": "College friend",
    "bio": "Met in university, works in tech",
    "birth_date": "1990-05-15",
    "notes": "Lives in San Francisco",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "Validation error",
  "details": []
}
```

---

## PUT /:id

Обновить информацию о человеке.

**Path Parameters:**
- `id`: integer, ID человека

**Request Body:**
```json
{
  "name": "John Smith",
  "category": "family",
  "relationship": "Brother-in-law",
  "bio": "Updated bio",
  "birth_date": "1990-05-15",
  "notes": "Moved to New York"
}
```

**Validation:**
- Все поля опциональны
- Валидация аналогична POST

**Allowed fields for update:**
- name
- category
- relationship
- bio
- birth_date
- notes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Smith",
    "category": "family",
    "relationship": "Brother-in-law",
    "bio": "Updated bio",
    "birth_date": "1990-05-15",
    "notes": "Moved to New York",
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
404 - Person not found

---

## DELETE /:id

Удалить человека.

**Path Parameters:**
- `id`: integer, ID человека

**Success Response (200):**
```json
{
  "success": true,
  "message": "Person deleted successfully"
}
```

**Notes:**
- ON DELETE CASCADE автоматически удалит все entry_people записи
- Удаление человека не удаляет записи (entries), только связи

**Error Responses:**

400 - Invalid ID format
404 - Person not found

---

## GET /most-mentioned

Получить самых упоминаемых людей.

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
      "id": 1,
      "user_id": 1,
      "name": "John Doe",
      "category": "friends",
      "relationship": "College friend",
      "bio": "Met in university",
      "birth_date": "1990-05-15",
      "notes": "Lives in SF",
      "created_at": "2025-01-04T10:00:00Z",
      "mention_count": 45
    }
  ]
}
```

**Notes:**
- Отсортировано по mention_count DESC
- Показывает только людей, упомянутых хотя бы раз (mention_count > 0)
- JOIN с entry_people и entries для подсчёта

---

## Дополнительные методы (в репозитории)

### getForEntry

Получить всех людей, связанных с записью.

**Internal method** (используется EntriesService)

```typescript
async getForEntry(entryId: string)
```

**Returns:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "category": "friends",
    "relationship": "College friend",
    "bio": "Met in university",
    "role": "participant",
    "notes": "Was at the event",
    "created_at": "2025-01-04T10:00:00Z"
  }
]
```

**Notes:**
- Включает поля `role` и `notes` из таблицы entry_people
- Используется при GET /api/v1/entries/:id

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Люди принадлежат пользователю (user_id)
- **Категории (4):**
  - `family` - семья
  - `friends` - друзья
  - `acquaintances` - знакомые
  - `strangers` - незнакомцы/случайные люди
- **Relationship:** произвольное текстовое поле для уточнения отношений (до 100 символов)
  - Примеры: "brother", "colleague", "neighbor", "classmate"
- **Bio:** расширенное описание человека
- **Birth date:** дата рождения в формате ISO (YYYY-MM-DD)
- **Notes:** произвольные заметки
- **Mention count:** подсчитывается динамически через LEFT JOIN с entry_people
  - Показывает, в скольких записях упоминается человек
- **Связь с записями:**
  - Люди связываются с entries через таблицу entry_people
  - В entry_people дополнительно хранятся: role (роль человека в событии) и notes
  - Связи создаются через POST /api/v1/entries/:id/people
- При удалении человека CASCADE удаляет все entry_people, но не сами entries
- Имена людей не обязаны быть уникальными (можно иметь несколько "John")
- Поиск работает только по имени (name)
- Сортировка по mentions полезна для определения ключевых фигур в жизни пользователя