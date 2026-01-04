# Tags Module API Documentation

Base path: `/api/v1/tags`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить все теги пользователя с фильтрацией и пагинацией.

**Query Parameters:**
```
search?: string (поиск по имени, ILIKE)
sort?: 'name' | 'usage' | 'created_at' (default: 'name')
page?: number (default: 1)
limit?: number (default: 100)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": 1,
        "user_id": 1,
        "name": "important",
        "created_at": "2025-01-04T10:00:00Z",
        "usage_count": 15
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 50,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- `usage_count` - количество записей с этим тегом (COUNT через LEFT JOIN)
- Сортировка по умолчанию: имя по алфавиту
- Поиск case-insensitive (ILIKE)

---

## GET /:id

Получить тег по ID.

**Path Parameters:**
- `id`: integer, ID тега

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "important",
    "created_at": "2025-01-04T10:00:00Z",
    "usage_count": 15
  }
}
```

**Error Responses:**

400 - Invalid ID format
404 - Tag not found

---

## POST /

Создать новый тег.

**Request Body:**
```json
{
  "name": "important"
}
```

**Validation:**
- `name`: обязательно, 1-50 символов
- Разрешены только буквы (включая русские), цифры, underscore и dash
- Regex: `/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/`

**Business Rules:**
- Имя тега должно быть уникальным для пользователя (case-insensitive)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "important",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "Tag name can only contain letters, numbers, underscore and dash"
}
```

400 - Duplicate name:
```json
{
  "success": false,
  "error": "Tag with this name already exists"
}
```

---

## PUT /:id

Обновить тег.

**Path Parameters:**
- `id`: integer, ID тега

**Request Body:**
```json
{
  "name": "very-important"
}
```

**Validation:**
- Аналогично POST
- Проверка уникальности (исключая сам тег)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "very-important",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Invalid ID или validation error
400 - Duplicate name
404 - Tag not found

---

## DELETE /:id

Удалить тег.

**Path Parameters:**
- `id`: integer, ID тега

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

**Notes:**
- ON DELETE CASCADE автоматически удалит все entry_tags
- Удаление тега не удаляет записи, только связи

**Error Responses:**

400 - Invalid ID format
404 - Tag not found

---

## GET /most-used

Получить самые используемые теги.

**Query Parameters:**
```
limit?: number (default: 20)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "important",
      "created_at": "2025-01-04T10:00:00Z",
      "usage_count": 25
    }
  ]
}
```

**Notes:**
- Отсортировано по usage_count DESC
- Показывает только теги с usage_count > 0
- HAVING COUNT(et.entry_id) > 0

---

## GET /unused

Получить неиспользуемые теги.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "user_id": 1,
      "name": "unused-tag",
      "created_at": "2025-01-04T10:00:00Z"
    }
  ]
}
```

**Notes:**
- Теги с usage_count = 0
- HAVING COUNT(et.entry_id) = 0
- Отсортировано по created_at DESC

---

## POST /find-or-create

Найти или создать тег (для автодополнения).

**Request Body:**
```json
{
  "name": "new-tag"
}
```

**Validation:**
- Аналогично POST

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "new-tag",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Notes:**
- Сначала ищет существующий тег по имени (case-insensitive)
- Если не найден - создаёт новый
- Полезно для UI с автодополнением

---

## GET /:id/entries

Получить записи, помеченные тегом.

**Path Parameters:**
- `id`: integer, ID тега

**Query Parameters:**
```
limit?: number (default: 50)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": 1,
      "entry_type": "dream",
      "content": "Entry content...",
      "created_at": "2025-01-04T10:00:00Z"
    }
  ]
}
```

**Notes:**
- Отсортировано по created_at DESC
- Возвращает полные объекты entries

**Error Responses:**

400 - Invalid ID
404 - Tag not found

---

## GET /:id/similar

Получить похожие теги (co-occurrence).

**Path Parameters:**
- `id`: integer, ID тега

**Query Parameters:**
```
limit?: number (default: 5)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "user_id": 1,
      "name": "related-tag",
      "created_at": "2025-01-04T10:00:00Z",
      "co_occurrence": 10
    }
  ]
}
```

**Notes:**
- Находит теги, которые часто используются вместе с данным тегом
- `co_occurrence` - количество записей, где оба тега встречаются вместе
- Использует self-join entry_tags для поиска совпадений
- Отсортировано по co_occurrence DESC
- Полезно для рекомендаций при тегировании

**Error Responses:**

400 - Invalid ID
404 - Tag not found

---

## GET /entry/:entryId

Получить теги для записи.

**Path Parameters:**
- `entryId`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "important",
      "created_at": "2025-01-04T10:00:00Z"
    }
  ]
}
```

**Notes:**
- Отсортировано по name ASC
- Проверяется, что запись принадлежит пользователю

**Error Responses:**

400 - Invalid UUID
404 - Entry not found

---

## POST /entry/:entryId

Привязать теги к записи (заменяет все существующие).

**Path Parameters:**
- `entryId`: UUID записи

**Request Body:**
```json
{
  "tags": [1, 2, 3]
}
```

**Validation:**
- `tags`: обязательно, массив positive integers, минимум 1 элемент

**Business Rules:**
- Операция выполняется в транзакции
- Сначала удаляются все старые теги записи (DELETE)
- Затем добавляются новые (INSERT с ON CONFLICT DO NOTHING)
- Все теги должны существовать и принадлежать пользователю
- Запись должна принадлежать пользователю

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tags attached successfully"
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "At least one tag must be provided"
}
```

400 - Tag not found:
```json
{
  "success": false,
  "error": "Tag with id 999 not found"
}
```

400 - Invalid UUID
404 - Entry not found

---

## DELETE /entry/:entryId

Удалить все теги из записи.

**Path Parameters:**
- `entryId`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tags detached successfully"
}
```

**Notes:**
- Удаляет все связи entry_tags для данной записи
- Сами теги остаются в системе
- Проверяется, что запись принадлежит пользователю

**Error Responses:**

400 - Invalid UUID
404 - Entry not found

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Теги принадлежат пользователю (user_id)
- Имена тегов уникальны в пределах пользователя (case-insensitive)
- **Допустимые символы в имени:** буквы (en/ru), цифры, underscore, dash
- **Usage count** подсчитывается динамически через LEFT JOIN с entry_tags
- **Сортировка:**
  - `name` - алфавитный порядок (по умолчанию)
  - `usage` - по количеству использований
  - `created_at` - по дате создания
- **Поиск** работает по ILIKE (case-insensitive, поддерживает частичное совпадение)
- **Find or create** полезен для автодополнения - не выдаёт ошибку на дубликат
- **Similar tags** основан на co-occurrence анализе (теги, встречающиеся вместе)
- При удалении тега CASCADE удаляет все entry_tags, но не сами записи
- Привязка тегов к записи полностью заменяет предыдущий набор (не добавляет)
- ON CONFLICT DO NOTHING предотвращает дубликаты в entry_tags