
### CIRCUMSTANCES

**неуправляемые обстоятельства**

```sql
CREATE TABLE circumstances (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp         TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- ПРИРОДНЫЕ (неуправляемые)
  weather           VARCHAR(50) DEFAULT NULL,
  temperature       SMALLINT DEFAULT NULL,
  moon_phase        VARCHAR(20) DEFAULT NULL,
  
  -- ГЛОБАЛЬНЫЕ СОБЫТИЯ (расширяемо)
  global_event      TEXT DEFAULT NULL,
  
  -- ПРОИЗВОЛЬНЫЕ
  notes             TEXT DEFAULT NULL,
  
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_circumstances_user ON circumstances(user_id);
CREATE INDEX idx_circumstances_timestamp ON circumstances(timestamp);
```

** обстоятельств:**
- **weather:** 'sunny', 'rainy', 'snowy', 'stormy'
- **moon_phase:** 'new_moon', 'full_moon', 'first_quarter', 'last_quarter'
- **global_event:** 'война', 'пандемия', 'выборы', 'экономический кризис', 'землетрясение'

---

### ENTRIES

**сны, мысли, воспоминания, планы**

```sql
CREATE TABLE entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type            VARCHAR(20) NOT NULL 
                        CHECK (entry_type IN ('dream', 'memory', 'thought', 'plan')),
  content               TEXT NOT NULL,
  
  -- ОПЦИОНАЛЬНЫЕ СВЯЗИ
  body_state_id         INT DEFAULT NULL REFERENCES body_states(id) ON DELETE SET NULL,
  circumstance_id       INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  
  -- ДЛЯ ПЛАНОВ
  deadline              DATE DEFAULT NULL,
  is_completed          BOOLEAN DEFAULT FALSE,
  
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

**Ключевые поля:**
- **body_state_id:** NULL = без физической привязки
- **circumstance_id:** NULL = обстоятельства не важны

---

### BODY_STATES

**состояние тела**

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE body_states (
  id                    SERIAL PRIMARY KEY,
  user_id               INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp             TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- ПРОСТРАНСТВО (PostGIS для географии)
  location_point        GEOGRAPHY(POINT, 4326) DEFAULT NULL,
  location_name         VARCHAR(200) DEFAULT NULL,
  location_address      TEXT DEFAULT NULL,
  location_precision    VARCHAR(20) DEFAULT NULL,
  
  -- ЗДОРОВЬЕ (HP + Mana)
  health_points         SMALLINT DEFAULT NULL 
                        CHECK (health_points IS NULL OR (health_points BETWEEN 0 AND 100)),
  energy_points         SMALLINT DEFAULT NULL 
                        CHECK (energy_points IS NULL OR (energy_points BETWEEN 0 AND 100)),
  
  -- СВЯЗЬ С ОБСТОЯТЕЛЬСТВАМИ
  circumstance_id       INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  
  created_at            TIMESTAMP DEFAULT NOW()
);
```

---

### SKILLS

**RPG-механика**

```sql
CREATE TABLE skills (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,
  category          VARCHAR(50) DEFAULT NULL,
  description       TEXT DEFAULT NULL,
  current_level     SMALLINT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 100),
  experience_points INT DEFAULT 0,
  icon              VARCHAR(50) DEFAULT NULL,
  color             VARCHAR(20) DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE skill_progress (
  id                SERIAL PRIMARY KEY,
  skill_id          INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  entry_id          UUID DEFAULT NULL REFERENCES entries(id) ON DELETE CASCADE,
  body_state_id     INT DEFAULT NULL REFERENCES body_states(id) ON DELETE CASCADE,
  progress_type     VARCHAR(20) DEFAULT 'practice',
  experience_gained INT DEFAULT 10,
  notes             TEXT DEFAULT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  CHECK (entry_id IS NOT NULL OR body_state_id IS NOT NULL)
);
```

---

##  Использования

### 1: Сон при полнолунии (БЕЗ физической привязки)

```sql
-- Создаём обстоятельства
INSERT INTO circumstances (user_id, moon_phase) VALUES
  (1, 'full_moon');  -- id = 10

-- Создаём запись сна (БЕЗ body_state)
INSERT INTO entries (user_id, entry_type, content, circumstance_id) VALUES
  (1, 'dream', 'Яркий сон про волков', 10);
```

**Результат:** Сон связан с полнолунием, но НЕ привязан к месту.

---

### 2: Воспоминание из-за дождя

```sql
-- Обстоятельства: дождь
INSERT INTO circumstances (user_id, weather) VALUES
  (1, 'rainy');

-- Воспоминание
INSERT INTO entries (user_id, entry_type, content, circumstance_id) VALUES
  (1, 'memory', 'Вспомнил как гулял под дождём в детстве', 
   (SELECT id FROM circumstances WHERE weather = 'rainy' ORDER BY created_at DESC LIMIT 1));
```

---

### 3: Мысль о войне (глобальное событие)

```sql
-- Обстоятельства: война
INSERT INTO circumstances (user_id, global_event, notes) VALUES
  (1, 'война', 'Началась война в соседней стране');

-- Мысль из-за войны
INSERT INTO entries (user_id, entry_type, content, circumstance_id) VALUES
  (1, 'thought', 'Думаю о безопасности семьи', 
   (SELECT id FROM circumstances WHERE global_event = 'война' ORDER BY created_at DESC LIMIT 1));
```

---

### 4: Тело + обстоятельства

```sql
-- Обстоятельства: жара
INSERT INTO circumstances (user_id, weather, temperature) VALUES
  (1, 'sunny', 35);

-- Тело в жару
INSERT INTO body_states (user_id, location_name, health_points, energy_points, circumstance_id) 
VALUES (1, 'Индия', 60, 40, 
        (SELECT id FROM circumstances ORDER BY created_at DESC LIMIT 1));

-- Мысль
INSERT INTO entries (user_id, entry_type, content, body_state_id, circumstance_id) VALUES
  (1, 'thought', 'Жара мешает думать', 
   (SELECT id FROM body_states ORDER BY created_at DESC LIMIT 1),
   (SELECT id FROM circumstances ORDER BY created_at DESC LIMIT 1));
```

---

### 5: Запрос — все сны при полнолунии

```sql
SELECT e.content, e.created_at, c.moon_phase
FROM entries e
JOIN circumstances c ON e.circumstance_id = c.id
WHERE e.entry_type = 'dream' 
  AND c.moon_phase = 'full_moon'
ORDER BY e.created_at DESC;
```

---

## Полная Миграция SQL

### Порядок выполнения:

1. Создать users
2. Включить PostGIS
3. Создать circumstances
4. Создать body_states (с ссылкой на circumstances)
5. Создать entries (с ссылками на body_states и circumstances)
6. Создать emotions + вставить 27 эмоций
7. Создать остальные таблицы
8. Создать индексы

```sql
-- ============================================
-- ПОЛНАЯ МИГРАЦИЯ БД
-- ============================================

-- 1. Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 2. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3. Circumstances
CREATE TABLE circumstances (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  weather VARCHAR(50) DEFAULT NULL,
  temperature SMALLINT DEFAULT NULL,
  moon_phase VARCHAR(20) DEFAULT NULL,
  global_event TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Body States
CREATE TABLE body_states (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  location_point GEOGRAPHY(POINT, 4326) DEFAULT NULL,
  location_name VARCHAR(200) DEFAULT NULL,
  location_address TEXT DEFAULT NULL,
  location_precision VARCHAR(20) DEFAULT NULL,
  health_points SMALLINT DEFAULT NULL CHECK (health_points IS NULL OR (health_points BETWEEN 0 AND 100)),
  energy_points SMALLINT DEFAULT NULL CHECK (energy_points IS NULL OR (energy_points BETWEEN 0 AND 100)),
  circumstance_id INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('dream', 'memory', 'thought', 'plan')),
  content TEXT NOT NULL,
  body_state_id INT DEFAULT NULL REFERENCES body_states(id) ON DELETE SET NULL,
  circumstance_id INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  deadline DATE DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Emotions
CREATE TABLE emotions (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(50) UNIQUE NOT NULL,
  name_ru VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('positive', 'negative', 'neutral')),
  description TEXT,
  parent_emotion_id INT REFERENCES emotions(id)
);

-- Insert 27 emotions
INSERT INTO emotions (id, name_en, name_ru, category) VALUES
  (1, 'Admiration', 'Восхищение', 'positive'),
  (2, 'Adoration', 'Обожание', 'positive'),
  (3, 'Aesthetic appreciation', 'Эстетическое наслаждение', 'positive'),
  (4, 'Amusement', 'Веселье', 'positive'),
  (5, 'Anger', 'Гнев', 'negative'),
  (6, 'Anxiety', 'Тревога', 'negative'),
  (7, 'Awe', 'Благоговение', 'neutral'),
  (8, 'Awkwardness', 'Неловкость', 'negative'),
  (9, 'Boredom', 'Скука', 'negative'),
  (10, 'Calmness', 'Спокойствие', 'positive'),
  (11, 'Confusion', 'Замешательство', 'negative'),
  (12, 'Craving', 'Жажда', 'neutral'),
  (13, 'Disgust', 'Отвращение', 'negative'),
  (14, 'Empathic pain', 'Эмпатическая боль', 'negative'),
  (15, 'Entrancement', 'Завороженность', 'neutral'),
  (16, 'Excitement', 'Возбуждение', 'positive'),
  (17, 'Fear', 'Страх', 'negative'),
  (18, 'Horror', 'Ужас', 'negative'),
  (19, 'Interest', 'Интерес', 'neutral'),
  (20, 'Joy', 'Радость', 'positive'),
  (21, 'Nostalgia', 'Ностальгия', 'neutral'),
  (22, 'Relief', 'Облегчение', 'positive'),
  (23, 'Romance', 'Романтика', 'positive'),
  (24, 'Sadness', 'Грусть', 'negative'),
  (25, 'Satisfaction', 'Удовлетворение', 'positive'),
  (26, 'Sexual desire', 'Сексуальное влечение', 'neutral'),
  (27, 'Surprise', 'Удивление', 'neutral');

-- 7. Entry Emotions
CREATE TABLE entry_emotions (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  emotion_id INT REFERENCES emotions(id),
  emotion_category VARCHAR(20),
  intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  CONSTRAINT check_emotion_or_category 
    CHECK ((emotion_id IS NOT NULL AND emotion_category IS NULL) OR
           (emotion_id IS NULL AND emotion_category IS NOT NULL))
);

-- 8. People
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('family', 'friends', 'acquaintances', 'strangers')),
  relationship VARCHAR(100),
  bio TEXT,
  birth_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 9. Entry People
CREATE TABLE entry_people (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role VARCHAR(50),
  notes TEXT,
  UNIQUE(entry_id, person_id)
);

-- 10. Entry Relations
CREATE TABLE entry_relations (
  id SERIAL PRIMARY KEY,
  from_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (from_entry_id != to_entry_id)
);

-- 11. Tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- 12. Skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  current_level SMALLINT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 100),
  experience_points INT DEFAULT 0,
  icon VARCHAR(50) DEFAULT NULL,
  color VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE skill_progress (
  id SERIAL PRIMARY KEY,
  skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  entry_id UUID DEFAULT NULL REFERENCES entries(id) ON DELETE CASCADE,
  body_state_id INT DEFAULT NULL REFERENCES body_states(id) ON DELETE CASCADE,
  progress_type VARCHAR(20) DEFAULT 'practice',
  experience_gained INT DEFAULT 10,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (entry_id IS NOT NULL OR body_state_id IS NOT NULL)
);

-- 13. AI Tables
CREATE TABLE ai_analysis (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  analysis_text TEXT NOT NULL,
  symbols_found JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  ai_model_version VARCHAR(50)
);

CREATE TABLE ai_images (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  image_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  ai_model_version VARCHAR(50)
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

CREATE INDEX idx_users_login ON users(login);

CREATE INDEX idx_circumstances_user ON circumstances(user_id);
CREATE INDEX idx_circumstances_timestamp ON circumstances(timestamp);

CREATE INDEX idx_body_states_user ON body_states(user_id);
CREATE INDEX idx_body_states_timestamp ON body_states(timestamp);
CREATE INDEX idx_body_states_location ON body_states USING GIST(location_point);
CREATE INDEX idx_body_states_circumstance ON body_states(circumstance_id);

CREATE INDEX idx_entries_user ON entries(user_id);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_entries_created ON entries(created_at);
CREATE INDEX idx_entries_body_state ON entries(body_state_id);
CREATE INDEX idx_entries_circumstance ON entries(circumstance_id);

CREATE INDEX idx_entry_emotions_entry ON entry_emotions(entry_id);
CREATE INDEX idx_entry_emotions_emotion ON entry_emotions(emotion_id);

CREATE INDEX idx_people_user ON people(user_id);
CREATE INDEX idx_people_category ON people(category);

CREATE INDEX idx_entry_people_entry ON entry_people(entry_id);
CREATE INDEX idx_entry_people_person ON entry_people(person_id);

CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type);

CREATE INDEX idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);

CREATE INDEX idx_skills_user ON skills(user_id);

CREATE INDEX idx_skill_progress_skill ON skill_progress(skill_id);
CREATE INDEX idx_skill_progress_entry ON skill_progress(entry_id);
CREATE INDEX idx_skill_progress_body ON skill_progress(body_state_id);

CREATE INDEX idx_ai_analysis_entry ON ai_analysis(entry_id);
CREATE INDEX idx_ai_images_entry ON ai_images(entry_id);

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- ============================================

-- Пользователь
INSERT INTO users (login, password_hash) VALUES
  ('testuser', '$2a$10$examplehash123456789');

-- Обстоятельства: полнолуние
INSERT INTO circumstances (user_id, moon_phase) VALUES
  (1, 'full_moon');

-- Обстоятельства: дождь
INSERT INTO circumstances (user_id, weather, temperature) VALUES
  (1, 'rainy', 15);

-- Обстоятельства: война
INSERT INTO circumstances (user_id, global_event, notes) VALUES
  (1, 'война', 'Геополитическая нестабильность');

-- Запись БЕЗ body_state и обстоятельств (чистое сознание)
INSERT INTO entries (user_id, entry_type, content) VALUES
  (1, 'thought', 'Размышлял о природе времени');

-- Сон при полнолунии (без body_state)
INSERT INTO entries (user_id, entry_type, content, circumstance_id) VALUES
  (1, 'dream', 'Яркий сон про волков', 1);

-- body_state с местом
INSERT INTO body_states (user_id, location_name, location_point) VALUES
  (1, 'Чебоксары', ST_Point(47.2517, 56.1326));

-- Воспоминание с местом и обстоятельствами (дождь)
INSERT INTO entries (user_id, entry_type, content, body_state_id, circumstance_id) 
VALUES (1, 'memory', 'Гулял под дождём в детстве', 1, 2);

-- Навык
INSERT INTO skills (user_id, name, description, category) VALUES
  (1, 'Дипломатия', 'Прокачиваю как Лавров', 'social');

-- Человек
INSERT INTO people (user_id, name, category, relationship) VALUES
  (1, 'Мама', 'family', 'мать');

-- Эмоция к воспоминанию
INSERT INTO entry_emotions (entry_id, emotion_id, intensity) 
SELECT id, 21, 9 FROM entries WHERE content = 'Гулял под дождём в детстве';

-- Связь между записями
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type, description)
SELECT 
  (SELECT id FROM entries WHERE content = 'Гулял под дождём в детстве'),
  (SELECT id FROM entries WHERE content = 'Яркий сон про волков'),
  'reminded_of',
  'Воспоминание о дожде напомнило о сне';
```
