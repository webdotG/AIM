# Архитектура БД

PostgreSQL   

Один объект = одна таблица (люди, эмоции, записи)  
Связи через junction tables (промежуточные таблицы)   
Граф связей между записями  
Plaintext контент для AI-анализа  
Анонимность через отсутствие персональных данных  

---

## Схема таблиц  

### 1. Users (Пользователи)  

```sql
users
  id                SERIAL PRIMARY KEY
  login             VARCHAR(50) UNIQUE NOT NULL
  password_hash     VARCHAR(128) NOT NULL
  created_at        TIMESTAMP DEFAULT NOW()
  last_login        TIMESTAMP
```

**Связи:**
→ entries (1:N)  
→ people (1:N)  
→ tags (1:N)  

---

### 2. Entries (Записи)

```sql
entries
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  entry_type        VARCHAR(20) NOT NULL CHECK (entry_type IN 
                      ('dream', 'memory', 'thought', 'plan'))
  content           TEXT NOT NULL
  created_at        TIMESTAMP DEFAULT NOW()
  updated_at        TIMESTAMP DEFAULT NOW()
  event_date        DATE
  deadline          DATE
  is_completed      BOOLEAN DEFAULT FALSE
```

**Связи:**   
← users (N:1)  
→ entry_emotions (1:N)  
→ entry_people (1:N)  
→ entry_tags (1:N)  
→ entry_relations (1:N как from, 1:N как to)  
→ ai_analysis (1:N)      
→ ai_images (1:N)  
→ ai_videos (1:N)    
  
`id` — UUID для непредсказуемости (безопасность)  
`entry_type` — строго 4 значения (dream/memory/thought/plan)  
`content` — **plaintext** (не шифруется, для AI)  
`created_at` — когда записал  
`event_date` — когда произошло событие (nullable, может быть "неделю назад")  
`deadline` — для планов (nullable)  
`is_completed` — для планов, выполнен ли  

**Индексы:**
```sql
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_entries_created_at ON entries(created_at);
CREATE INDEX idx_entries_event_date ON entries(event_date);
```

---

### 3. Emotions (Справочник эмоций)

```sql
emotions
  id                SERIAL PRIMARY KEY
  name_en           VARCHAR(50) UNIQUE NOT NULL
  name_ru           VARCHAR(50) UNIQUE NOT NULL
  category          VARCHAR(20) NOT NULL CHECK (category IN 
                      ('positive', 'negative', 'neutral'))
  description       TEXT
  parent_emotion_id INT REFERENCES emotions(id)
```
  
**Связи:**  
→ entry_emotions (1:N)  
→ emotions (self-reference для иерархии)  

Фиксированный справочник (27 эмоций UC Berkeley)  
`parent_emotion_id` — для иерархии (опционально)  
  Радость (parent)  
    Восторг (child)  
    Удовлетворение (child)  
Заполняется при инициализации БД (migration)  

**Пример данных:**
```sql
INSERT INTO emotions (id, name_en, name_ru, category) VALUES
  (1, 'Admiration', 'Восхищение', 'positive'),
  (2, 'Adoration', 'Обожание', 'positive'),
  (5, 'Anger', 'Гнев', 'negative'),
  (21, 'Nostalgia', 'Ностальгия', 'neutral');
```

---

### 4. Entry_Emotions (Связь записи ↔ эмоции)

```sql
entry_emotions
  id                SERIAL PRIMARY KEY
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  emotion_id        INT REFERENCES emotions(id)
  emotion_category  VARCHAR(20) CHECK (emotion_category IN 
                      ('positive', 'negative', 'neutral'))
  intensity         SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10)
  CONSTRAINT check_emotion_or_category 
    CHECK ((emotion_id IS NOT NULL AND emotion_category IS NULL) OR
           (emotion_id IS NULL AND emotion_category IS NOT NULL))
```

**Связь:** Many-to-Many между entries и emotions  

Либо конкретная эмоция (`emotion_id`), либо только категория (`emotion_category`)  
Constraint гарантирует: заполнено что-то одно, не оба  

**Индексы:**
```sql
CREATE INDEX idx_entry_emotions_entry ON entry_emotions(entry_id);
CREATE INDEX idx_entry_emotions_emotion ON entry_emotions(emotion_id);
```

---

### 5. People (Справочник людей пользователя)

```sql
people
  id                SERIAL PRIMARY KEY
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  name              VARCHAR(100) NOT NULL
  category          VARCHAR(20) NOT NULL CHECK (category IN 
                      ('family', 'friends', 'acquaintances', 'strangers'))
  relationship      VARCHAR(100)
  bio               TEXT
  birth_date        DATE
  notes             TEXT
  created_at        TIMESTAMP DEFAULT NOW()
  UNIQUE(user_id, name)
```

**Связи:**  
← users (N:1)  
→ entry_people (1:N)  

Один человек = один объект в БД  
`UNIQUE(user_id, name)` — у одного пользователя не может быть двух "Мама"  
`category` — родные/друзья/знакомые/случайные  
`relationship` — "мать", "коллега", "одноклассник"  
`bio` — пользователь сам составляет описание человека  

**Индексы:**
```sql
CREATE INDEX idx_people_user ON people(user_id);
CREATE INDEX idx_people_category ON people(category);
```

---

### 6. Entry_People (Связь записи ↔ люди)  

```sql
entry_people
  id                SERIAL PRIMARY KEY
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  person_id         INT NOT NULL REFERENCES people(id) ON DELETE CASCADE
  role              VARCHAR(50)
  notes             TEXT
  UNIQUE(entry_id, person_id)
```

**Связь:** Many-to-Many между entries и people  

`role` — "главный герой", "упоминается", "фоновый персонаж"  
`notes` — контекст упоминания в этой конкретной записи  

**Пример:**
```sql
-Сон где фигурируют мама и друг
INSERT INTO entry_people (entry_id, person_id, role) VALUES
  ('uuid-123', 5, 'main_character'),  -Мама — главный герой
  ('uuid-123', 12, 'mentioned');      -Друг — упоминается
```

**Индексы:**
```sql
CREATE INDEX idx_entry_people_entry ON entry_people(entry_id);
CREATE INDEX idx_entry_people_person ON entry_people(person_id);
```

---

### 7. Entry_Relations (Связи между записями)  

```sql
entry_relations
  id                SERIAL PRIMARY KEY
  from_entry_id     UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  to_entry_id       UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  relation_type     VARCHAR(50) NOT NULL
  description       TEXT
  created_at        TIMESTAMP DEFAULT NOW()
  CHECK (from_entry_id != to_entry_id)
```

**Связь:** Направленный граф записей (Many-to-Many самореференс)  

**Типы связей:**  
`led_to` — привело к  
`reminded_of` — напомнило о  
`inspired_by` — вдохновлено  
`caused_by` — вызвано  
`related_to` — связано с  
`resulted_in` — привело к результату  
  
Направленная связь: A → B (from → to)  
Может быть циклической: A → B → C → A  
`description` — пояснение связи  
   
**Пример цепочки:**
```sql
-Воспоминание → Сон → План  
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type) VALUES
  ('memory-uuid', 'dream-uuid', 'reminded_of'),
  ('dream-uuid', 'plan-uuid', 'led_to');
```

**Индексы:**
```sql
CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type);
```

---

### 8. Tags (Теги пользователя)

```sql
tags
  id                SERIAL PRIMARY KEY
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  name              VARCHAR(50) NOT NULL
  created_at        TIMESTAMP DEFAULT NOW()
  UNIQUE(user_id, name)
```

**Связи:**
← users (N:1)  
→ entry_tags (1:N)  

Гибкая категоризация (кроме эмоций и людей)  

---

### 9. Entry_Tags (Связь записи ↔ теги)  

```sql
entry_tags
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  tag_id            INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  PRIMARY KEY (entry_id, tag_id)
```

**Связь:** Many-to-Many между entries и tags  

**Индексы:**
```sql
CREATE INDEX idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);
```

---

### 10. AI_Analysis (Психоаналитик)  

```sql
ai_analysis
  id                SERIAL PRIMARY KEY
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  analysis_type     VARCHAR(50) NOT NULL
  analysis_text     TEXT NOT NULL
  symbols_found     JSONB
  created_at        TIMESTAMP DEFAULT NOW()
  ai_model_version  VARCHAR(50)
```

**Связь:** One-to-Many (entries → ai_analysis)  

`analysis_type` — "jungian", "freudian", "general"  
`symbols_found` — JSON с архетипами/символами  
`ai_model_version` — версионирование AI  

**Пример:**
```json
symbols_found: {
  "archetypes": ["Shadow", "Anima"],
  "symbols": ["вода", "полёт", "дом"],
  "themes": ["transformation", "rebirth"]
}
```

---
 
### 11. AI_Images (Генератор картинок)  

```sql
ai_images
  id                SERIAL PRIMARY KEY
  entry_id          UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  image_url         TEXT NOT NULL
  prompt_used       TEXT
  image_metadata    JSONB
  created_at        TIMESTAMP DEFAULT NOW()
  ai_model_version  VARCHAR(50)
```

**Связь:** One-to-Many (entries → ai_images)  

`image_url` — S3/CDN ссылка  
`prompt_used` — какой промпт отправили в AI  
`image_metadata` — размер, формат и т.д.  

---

## Диаграмма связей

```
users (1) ──────────────┬────────────────────────┐
                        │                        │
                        ↓                        ↓
                    entries (N)              people (N)
                        │                        │
        ┌───────────────┼────────────────┬───────┤
        │               │                │       │
        ↓               ↓                ↓       ↓
  entry_emotions  entry_people    entry_tags  entry_relations
        │               │                │       │
        ↓               ↓                ↓       ↓ (self-reference)
    emotions (N)        └──────┬─────────┘    entries
                               │
                               ↓
                             tags (N)

entries (1) ────┬──────────┬──────────┐
                │          │          │
                ↓          ↓          ↓
          ai_analysis  ai_images  ai_videos
              (N)        (N)        (N)
```
(1) — один
(N) — много
→ — направление связи

---

## Примеры запросов  

### 1. Все записи пользователя с эмоциями  

```sql
SELECT 
  e.id,
  e.entry_type,
  e.content,
  json_agg(json_build_object(
    'emotion', em.name_ru,
    'intensity', ee.intensity
  )) as emotions
FROM entries e
LEFT JOIN entry_emotions ee ON e.id = ee.entry_id
LEFT JOIN emotions em ON ee.emotion_id = em.id
WHERE e.user_id = $1
GROUP BY e.id;
```

### 2. Все записи где упоминается конкретный человек
  
```sql
SELECT e.*
FROM entries e
JOIN entry_people ep ON e.id = ep.entry_id
WHERE ep.person_id = $1
ORDER BY e.created_at DESC;
```

### 3. Граф связей записи

```sql
-Прямые связи (A → B)  
SELECT 
  to_entry_id as related_entry_id,
  relation_type
FROM entry_relations
WHERE from_entry_id = $1

UNION

-Обратные связи (B → A)  
SELECT 
  from_entry_id as related_entry_id,
  relation_type || '_reverse' as relation_type
FROM entry_relations
WHERE to_entry_id = $1;
```

### 4. Статистика эмоций за период  

```sql
SELECT 
  em.name_ru,
  em.category,
  COUNT(*) as count,
  AVG(ee.intensity) as avg_intensity
FROM entry_emotions ee
JOIN emotions em ON ee.emotion_id = em.id
JOIN entries e ON ee.entry_id = e.id
WHERE e.user_id = $1
  AND e.created_at >= $2
  AND e.created_at <= $3
GROUP BY em.id, em.name_ru, em.category
ORDER BY count DESC;
```

---

## Миграции  

Рекомендация  использовать миграции (например, через `node-pg-migrate` или `Knex.js`):  

```
migrations/
  001_create_users.sql
  002_create_entries.sql
  003_create_emotions.sql
  004_create_entry_emotions.sql
  005_create_people.sql
  006_create_entry_people.sql
  007_create_entry_relations.sql
  008_create_tags.sql
  009_create_entry_tags.sql
  010_create_ai_tables.sql
  011_insert_emotions_data.sql  ← 27 эмоций UC Berkeley
```

---

### Что уже есть:  
Индексы на FK  
Индексы на часто запрашиваемых полях  
ON DELETE CASCADE (автоудаление)  

### В разработке:  
Партиционирование entries по user_id (для масштабирования)  
Materialized views для статистики
Full-text search для content (PostgreSQL FTS)  
JSONB индексы для symbols_found  

---

## Размер БД (примерная оценка)  

Для 1000 пользователей, каждый пишет ~100 записей в год:  
  
```
entries:         100,000 записей × ~2KB = 200 MB
entry_emotions:  200,000 связей × 20 bytes = 4 MB
entry_people:    150,000 связей × 20 bytes = 3 MB
people:          10,000 людей × 200 bytes = 2 MB
ai_analysis:     50,000 анализов × 1KB = 50 MB
ai_images:       ссылки (не сами файлы) = 5 MB
ai_videos:       ссылки (не сами файлы) = 2 MB

Итого: ~270 MB + индексы (~100 MB) = ~370 MB
```

Реальные файлы (картинки/видео) хранятся в S3/CDN.  