# Analytics Module API Documentation

Base path: `/api/v1/analytics`

**Authentication:** Все endpoints требуют JWT токен в заголовке `Authorization: Bearer <token>`

## GET /stats

Получить общую статистику пользователя.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "dreams": 125,
    "memories": 89,
    "thoughts": 234,
    "plans": 45,
    "completed_plans": 32,
    "overdue_plans": 5,
    "total_entries": 493
  }
}
```

**Notes:**
- Подсчитывает записи по типам (entry_type)
- `completed_plans` - планы с is_completed = true
- `overdue_plans` - незавершённые планы с deadline < NOW()
- `total_entries` - общее количество записей

---

## GET /entries-by-month

Получить распределение записей по месяцам.

**Query Parameters:**
```
months?: number (default: 12, количество месяцев назад)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "2025-01",
      "entry_type": "dream",
      "count": 15
    },
    {
      "month": "2025-01",
      "entry_type": "memory",
      "count": 10
    },
    {
      "month": "2024-12",
      "entry_type": "thought",
      "count": 25
    }
  ]
}
```

**Notes:**
- Формат month: 'YYYY-MM'
- Группировка по месяцу и типу записи
- Отсортировано по month DESC
- Показывает данные за последние N месяцев от текущей даты
- Используется для построения графиков активности

---

## GET /emotion-distribution

Получить распределение эмоций по категориям.

**Query Parameters:**
```
from?: string (ISO datetime, начало периода)
to?: string (ISO datetime, конец периода)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "positive",
      "count": 145,
      "avg_intensity": 7.8
    },
    {
      "category": "negative",
      "count": 89,
      "avg_intensity": 6.2
    },
    {
      "category": "neutral",
      "count": 34,
      "avg_intensity": 5.5
    }
  ]
}
```

**Notes:**
- Анализирует все entry_emotions пользователя
- Группирует по категориям эмоций (positive, negative, neutral)
- `count` - количество записей эмоций в категории
- `avg_intensity` - средняя интенсивность эмоций (1-10)
- Если from/to не указаны, анализирует все записи за всё время
- JOIN через entries для фильтрации по user_id
- Полезно для mood tracking и анализа эмоционального состояния

---

## GET /activity-heatmap

Получить карту активности по дням года (для GitHub-style heatmap).

**Query Parameters:**
```
year?: number (default: текущий год, формат: YYYY)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-01",
      "count": 3
    },
    {
      "date": "2025-01-02",
      "count": 5
    },
    {
      "date": "2025-01-03",
      "count": 0
    },
    {
      "date": "2025-01-04",
      "count": 7
    }
  ]
}
```

**Notes:**
- Формат date: 'YYYY-MM-DD'
- `count` - количество записей в этот день
- Включает только дни, когда были записи (дни с count=0 отсутствуют)
- Отсортировано по date ASC
- Показывает все дни указанного года (где EXTRACT(YEAR) = год)
- Используется для визуализации в стиле GitHub contribution graph
- Frontend должен заполнить пропущенные дни нулями

---

## GET /streaks

Получить текущую серию дней подряд (streak).

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "current_streak": 15
  }
}
```

**Notes:**
- `current_streak` - количество дней подряд с записями, включая сегодня
- Считает только последнюю непрерывную серию
- Если сегодня нет записи, streak = 0
- Использует CTE для группировки последовательных дней
- Алгоритм:
  1. Берёт уникальные даты записей (DATE(created_at))
  2. Группирует последовательные даты через ROW_NUMBER
  3. Находит группу, содержащую самую свежую дату
  4. Считает количество дней в этой группе
- Полезно для мотивации пользователей вести дневник регулярно

---

## Общие замечания

- Все endpoints требуют аутентификации (JWT токен)
- Все данные фильтруются по user_id
- **Архитектура:** AnalyticsService работает напрямую с Pool (без отдельного Repository)
- **Оптимизация:**
  - Используется COUNT(*) FILTER для подсчёта по условиям
  - CTE (Common Table Expressions) для сложных запросов
  - Группировка выполняется на стороне БД
- **Use cases:**
  - `/stats` - dashboard с общей статистикой
  - `/entries-by-month` - графики активности по месяцам
  - `/emotion-distribution` - pie chart или bar chart настроения
  - `/activity-heatmap` - GitHub-style calendar heatmap
  - `/streaks` - badge "X дней подряд"
- **Даты:**
  - Все timestamps в UTC
  - Heatmap использует DATE() для группировки по дням
  - Streaks работает только с уникальными датами (не время)
- **Производительность:**
  - Запросы оптимизированы с индексами на (user_id, created_at)
  - Фильтрация FILTER работает быстрее, чем CASE WHEN
  - Для больших датасетов можно добавить LIMIT в entries-by-month
- **Расширяемость:**
  - Можно добавить /tags-stats - популярные теги
  - Можно добавить /people-stats - топ упоминаемых людей
  - Можно добавить /skills-progress - динамика роста навыков
  - Можно добавить /weather-correlation - корреляция погоды и настроения