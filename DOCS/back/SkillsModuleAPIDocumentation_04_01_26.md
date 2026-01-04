# Skills Module API Documentation

Base path: `/api/v1/skills`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /

Получить все навыки пользователя с фильтрацией и пагинацией.

**Query Parameters:**
```
category?: string (фильтр по категории)
sort?: 'level' | 'experience' | 'name' | 'created_at' (default: 'created_at')
page?: number (default: 1)
limit?: number (default: 50)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": 1,
        "user_id": 1,
        "name": "Programming",
        "category": "Technical",
        "description": "Software development skills",
        "current_level": 15,
        "experience_points": 1450,
        "icon": "",
        "color": "#3498db",
        "created_at": "2025-01-04T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- Сортировка:
  - `level` - current_level DESC
  - `experience` - experience_points DESC
  - `name` - name ASC
  - `created_at` - created_at DESC (по умолчанию)

---

## GET /:id

Получить навык по ID с историей прогресса.

**Path Parameters:**
- `id`: integer, ID навыка

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Programming",
    "category": "Technical",
    "description": "Software development skills",
    "current_level": 15,
    "experience_points": 1450,
    "icon": "",
    "color": "#3498db",
    "created_at": "2025-01-04T10:00:00Z",
    "progress_history": [
      {
        "id": 1,
        "skill_id": 1,
        "entry_id": "uuid",
        "body_state_id": null,
        "progress_type": "practice",
        "experience_gained": 50,
        "notes": "Completed a project",
        "created_at": "2025-01-04T11:00:00Z",
        "entry_content": "Worked on...",
        "entry_type": "memory",
        "body_state_location": null
      }
    ]
  }
}
```

**Error Responses:**

400 - Invalid ID format
404 - Skill not found

---

## POST /

Создать новый навык.

**Request Body:**
```json
{
  "name": "Programming",
  "category": "Technical",
  "description": "Software development skills",
  "icon": "",
  "color": "#3498db"
}
```

**Validation:**
- `name`: обязательно, 1-100 символов
- `category`: опционально, max 50 символов
- `description`: опционально
- `icon`: опционально, max 50 символов (emoji или иконка)
- `color`: опционально, max 20 символов (hex или название)

**Business Rules:**
- Имя навыка должно быть уникальным для пользователя (case-insensitive)
- current_level по умолчанию = 1
- experience_points по умолчанию = 0

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Programming",
    "category": "Technical",
    "description": "Software development skills",
    "current_level": 1,
    "experience_points": 0,
    "icon": "",
    "color": "#3498db",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Validation error
400 - Duplicate name:
```json
{
  "success": false,
  "error": "Skill with this name already exists"
}
```

---

## PUT /:id

Обновить навык.

**Path Parameters:**
- `id`: integer, ID навыка

**Request Body:**
```json
{
  "name": "Advanced Programming",
  "category": "Technical",
  "description": "Updated description",
  "current_level": 20,
  "experience_points": 2000,
  "icon": "",
  "color": "#2ecc71"
}
```

**Validation:**
- Все поля опциональны
- `name`: 1-100 символов если указан
- `current_level`: 1-100
- `experience_points`: >= 0

**Allowed fields for update:**
- name
- category
- description
- current_level (обычно не обновляется вручную, а через addProgress)
- experience_points (обычно не обновляется вручную)
- icon
- color

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Advanced Programming",
    "category": "Technical",
    "description": "Updated description",
    "current_level": 20,
    "experience_points": 2000,
    "icon": "",
    "color": "#2ecc71",
    "created_at": "2025-01-04T10:00:00Z"
  }
}
```

**Error Responses:**

400 - Invalid ID или validation error
400 - Duplicate name (если меняем имя)
404 - Skill not found

---

## DELETE /:id

Удалить навык.

**Path Parameters:**
- `id`: integer, ID навыка

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

**Notes:**
- ON DELETE CASCADE автоматически удалит все skill_progress записи

**Error Responses:**

400 - Invalid ID format
404 - Skill not found

---

## POST /:id/progress

Добавить прогресс к навыку.

**Path Parameters:**
- `id`: integer, ID навыка

**Request Body:**
```json
{
  "entry_id": "uuid",
  "body_state_id": null,
  "progress_type": "practice",
  "experience_gained": 50,
  "notes": "Completed a challenging task"
}
```

**Validation:**
- `entry_id`: опционально, UUID (связь с записью)
- `body_state_id`: опционально, positive integer (связь с состоянием тела)
- **Должен быть указан хотя бы один**: entry_id или body_state_id
- `progress_type`: обязательно, одно из: 'practice', 'achievement', 'lesson', 'milestone' (default: 'practice')
- `experience_gained`: обязательно, integer 1-1000 (default: 10)
- `notes`: опционально, string

**Business Rules:**
- Добавляет запись в skill_progress
- Автоматически обновляет experience_points навыка
- Автоматически пересчитывает current_level
- **Формула левелинга**: 1 уровень = 100 опыта, максимум 100 уровней
- Если происходит повышение уровня, возвращается level_up: true

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "progress": {
      "id": 1,
      "skill_id": 1,
      "entry_id": "uuid",
      "body_state_id": null,
      "progress_type": "practice",
      "experience_gained": 50,
      "notes": "Completed a challenging task",
      "created_at": "2025-01-04T11:00:00Z"
    },
    "skill": {
      "id": 1,
      "user_id": 1,
      "name": "Programming",
      "current_level": 16,
      "experience_points": 1500,
      "created_at": "2025-01-04T10:00:00Z"
    },
    "level_up": true,
    "levels_gained": 1
  },
  "message": "Level up! +1 level(s)"
}
```

**Success Response (no level up):**
```json
{
  "success": true,
  "data": {
    "progress": {...},
    "skill": {...},
    "level_up": false,
    "levels_gained": 0
  },
  "message": "Progress added"
}
```

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "Either entry_id or body_state_id must be provided"
}
```

400 - Invalid ID
404 - Skill not found

---

## GET /:id/progress

Получить историю прогресса навыка.

**Path Parameters:**
- `id`: integer, ID навыка

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "skill_id": 1,
      "entry_id": "uuid",
      "body_state_id": null,
      "progress_type": "practice",
      "experience_gained": 50,
      "notes": "Completed a task",
      "created_at": "2025-01-04T11:00:00Z",
      "entry_content": "Worked on...",
      "entry_type": "memory",
      "body_state_location": null
    }
  ]
}
```

**Notes:**
- Отсортировано по created_at DESC
- Лимит по умолчанию: 50 записей
- Включает связанные данные из entries и body_states через LEFT JOIN

**Error Responses:**

400 - Invalid ID
404 - Skill not found

---

## GET /categories

Получить все категории навыков пользователя с подсчётом.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "Technical",
      "count": 10
    },
    {
      "category": "Creative",
      "count": 5
    }
  ]
}
```

**Notes:**
- Отсортировано по count DESC
- Показывает только категории, где category IS NOT NULL
- count - количество навыков в категории

---

## GET /top

Получить топ навыков пользователя.

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
      "name": "Programming",
      "category": "Technical",
      "current_level": 25,
      "experience_points": 2450,
      "icon": "",
      "color": "#3498db",
      "created_at": "2025-01-04T10:00:00Z"
    }
  ]
}
```

**Notes:**
- Отсортировано по current_level DESC, затем по experience_points DESC
- Полезно для dashboard с топовыми навыками

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Навыки принадлежат пользователю (user_id)
- **Система левелинга:**
  - Начальный уровень: 1
  - Максимальный уровень: 100
  - Формула: `level = min(100, floor(1 + experience_points / 100))`
  - 0-99 опыта = уровень 1
  - 100-199 опыта = уровень 2
  - 200-299 опыта = уровень 3
  - И так далее до уровня 100
- **Progress types:**
  - `practice` - регулярная практика
  - `achievement` - достижение/цель
  - `lesson` - пройденный урок
  - `milestone` - важная веха
- **Связи:**
  - Прогресс можно привязать к entry (запись в дневнике)
  - Прогресс можно привязать к body_state (состояние тела)
  - Должна быть указана хотя бы одна связь
- **Категории:**
  - Произвольные строки (до 50 символов)
  - Используются для группировки навыков
  - Не являются справочником
- **Icon и color:**
  - Для визуализации в UI
  - icon - обычно emoji или название иконки
  - color - hex код или название цвета
- При удалении навыка CASCADE удаляет весь skill_progress
- Имена навыков уникальны в пределах пользователя (case-insensitive)
- История прогресса включает метаданные о связанных entry и body_state