# Emotions Module API Documentation

Base path: `/api/v1/emotions`

## GET /

Получить все эмоции из справочника (27 эмоций).

**Authentication:** Не требуется

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "joy",
      "name_ru": "радость",
      "category": "positive"
    },
    {
      "id": 2,
      "name_en": "sadness",
      "name_ru": "грусть",
      "category": "negative"
    }
  ]
}
```

---

## GET /category/:category

Получить эмоции по категории.

**Authentication:** Требуется JWT токен

**Path Parameters:**
- `category`: 'positive' | 'negative' | 'neutral'

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "joy",
      "name_ru": "радость",
      "category": "positive"
    }
  ]
}
```

**Error Response:**

400 - Invalid category:
```json
{
  "success": false,
  "error": "Invalid category. Must be: positive, negative, or neutral"
}
```

---

## GET /stats

Получить статистику по эмоциям пользователя.

**Authentication:** Требуется JWT токен

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
      "emotion_id": 1,
      "name_en": "joy",
      "name_ru": "радость",
      "category": "positive",
      "count": 15,
      "avg_intensity": 7.5,
      "max_intensity": 10
    }
  ]
}
```

**Notes:**
- Результаты отсортированы по count DESC
- Если from/to не указаны, возвращается статистика за всё время

---

## GET /most-frequent

Получить самые частые эмоции пользователя.

**Authentication:** Требуется JWT токен

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
      "name_en": "joy",
      "name_ru": "радость",
      "category": "positive",
      "count": 25
    }
  ]
}
```

**Notes:**
- Отсортировано по количеству использований (count DESC)
- Максимум возвращается limit записей

---

## GET /distribution

Получить распределение эмоций по категориям.

**Authentication:** Требуется JWT токен

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
      "category": "positive",
      "count": 45,
      "avg_intensity": 7.8
    },
    {
      "category": "negative",
      "count": 30,
      "avg_intensity": 6.2
    },
    {
      "category": "neutral",
      "count": 10,
      "avg_intensity": 5.0
    }
  ]
}
```

**Notes:**
- Показывает распределение по трём категориям
- Отсортировано по count DESC

---

## GET /timeline

Получить эмоции по времени.

**Authentication:** Требуется JWT токен

**Query Parameters:**
```
from: string (required, ISO datetime)
to: string (required, ISO datetime)
granularity?: 'day' | 'week' | 'month' (default: 'day')
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "period": "2025-01-04",
      "category": "positive",
      "count": 5,
      "avg_intensity": 7.5
    },
    {
      "period": "2025-01-04",
      "category": "negative",
      "count": 2,
      "avg_intensity": 6.0
    }
  ]
}
```

**Notes:**
- `period` формат зависит от granularity:
  - day: 'YYYY-MM-DD'
  - week: 'IYYY-IW' (ISO year-week)
  - month: 'YYYY-MM'
- Данные сгруппированы по периоду и категории
- Отсортировано по period ASC

---

## GET /entry/:entryId

Получить эмоции для конкретной записи.

**Authentication:** Требуется JWT токен

**Path Parameters:**
- `entryId`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "emotion_id": 5,
      "intensity": 8,
      "name_en": "joy",
      "name_ru": "радость",
      "category": "positive"
    }
  ]
}
```

**Notes:**
- Отсортировано по intensity DESC
- Проверяется, что запись принадлежит пользователю

**Error Responses:**

400 - Invalid UUID:
```json
{
  "success": false,
  "error": "Invalid entry ID format"
}
```

404 - Entry not found:
```json
{
  "success": false,
  "error": "Entry not found"
}
```

---

## POST /entry/:entryId

Привязать эмоции к записи (заменяет все существующие).

**Authentication:** Требуется JWT токен

**Path Parameters:**
- `entryId`: UUID записи

**Request Body:**
```json
{
  "emotions": [
    {
      "emotion_id": 1,
      "intensity": 8
    },
    {
      "emotion_id": 5,
      "intensity": 6
    }
  ]
}
```

**Validation:**
- `emotions`: обязательно, массив минимум 1 элемент
- `emotion_id`: обязательно, positive integer
- `intensity`: обязательно, integer от 1 до 10

**Success Response (200):**
```json
{
  "success": true,
  "message": "Emotions attached successfully"
}
```

**Notes:**
- Операция выполняется в транзакции
- Сначала удаляются все старые эмоции записи
- Затем добавляются новые
- Проверяется существование emotion_id в справочнике
- Проверяется, что запись принадлежит пользователю

**Error Responses:**

400 - Validation error:
```json
{
  "success": false,
  "error": "At least one emotion must be provided"
}
```

400 - Invalid emotion_id:
```json
{
  "success": false,
  "error": "Emotion with id 999 not found"
}
```

400 - Invalid intensity:
```json
{
  "success": false,
  "error": "Intensity must be between 1 and 10"
}
```

404 - Entry not found:
```json
{
  "success": false,
  "error": "Entry not found"
}
```

---

## DELETE /entry/:entryId

Удалить все эмоции из записи.

**Authentication:** Требуется JWT токен

**Path Parameters:**
- `entryId`: UUID записи

**Success Response (200):**
```json
{
  "success": true,
  "message": "Emotions detached successfully"
}
```

**Notes:**
- Удаляет все связи entry_emotions для данной записи
- Проверяется, что запись принадлежит пользователю

**Error Responses:**

400 - Invalid UUID
404 - Entry not found

---

## Общие замечания

- Справочник содержит 27 предопределённых эмоций
- Эмоции разделены на 3 категории: positive, negative, neutral
- Интенсивность эмоций измеряется по шкале 1-10
- К одной записи можно привязать несколько эмоций
- При обновлении эмоций записи старые полностью заменяются новыми
- Все аналитические endpoints (stats, most-frequent, distribution, timeline) работают только с данными текущего пользователя
- Эмоции сортируются по интенсивности (DESC) при выводе для записи