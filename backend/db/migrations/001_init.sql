-- db/migrations/002_create_fresh_schema.sql
-- ПОЛНАЯ НОВАЯ СТРУКТУРА С НУЛЯ

-- 1. Удаляем все старые таблицы (если существуют)
DROP TABLE IF EXISTS ai_images CASCADE;
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS skill_progress CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS entry_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS entry_relations CASCADE;
DROP TABLE IF EXISTS entry_people CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS entry_emotions CASCADE;
DROP TABLE IF EXISTS emotions CASCADE;
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS body_states CASCADE;
DROP TABLE IF EXISTS circumstances CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Включаем PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3. Таблица пользователей
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  backup_code_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 4. Таблица обстоятельств
CREATE TABLE circumstances (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- ПРИРОДНЫЕ
  weather VARCHAR(50) DEFAULT NULL,
  temperature SMALLINT DEFAULT NULL,
  moon_phase VARCHAR(20) DEFAULT NULL,
  
  -- ГЛОБАЛЬНЫЕ СОБЫТИЯ
  global_event TEXT DEFAULT NULL,
  
  -- ПРОИЗВОЛЬНЫЕ
  notes TEXT DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Таблица состояний тела
CREATE TABLE body_states (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- ПРОСТРАНСТВО
  location_point GEOGRAPHY(POINT, 4326) DEFAULT NULL,
  location_name VARCHAR(200) DEFAULT NULL,
  location_address TEXT DEFAULT NULL,
  location_precision VARCHAR(20) DEFAULT NULL,
  
  -- ЗДОРОВЬЕ
  health_points SMALLINT DEFAULT NULL 
    CHECK (health_points IS NULL OR (health_points BETWEEN 0 AND 100)),
  energy_points SMALLINT DEFAULT NULL 
    CHECK (energy_points IS NULL OR (energy_points BETWEEN 0 AND 100)),
  
  -- СВЯЗЬ С ОБСТОЯТЕЛЬСТВАМИ
  circumstance_id INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Таблица записей (сны, мысли, воспоминания, планы)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL 
    CHECK (entry_type IN ('dream', 'memory', 'thought', 'plan')),
  content TEXT NOT NULL,
  
  -- ОПЦИОНАЛЬНЫЕ СВЯЗИ
  body_state_id INT DEFAULT NULL REFERENCES body_states(id) ON DELETE SET NULL,
  circumstance_id INT DEFAULT NULL REFERENCES circumstances(id) ON DELETE SET NULL,
  
  -- ДЛЯ ПЛАНОВ
  deadline DATE DEFAULT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Таблица эмоций
CREATE TABLE emotions (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(50) UNIQUE NOT NULL,
  name_ru VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('positive', 'negative', 'neutral')),
  description TEXT
);

-- 8. Связь записей с эмоциями
CREATE TABLE entry_emotions (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  emotion_id INT REFERENCES emotions(id),
  intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10)
);

-- 9. Таблица людей
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

-- 10. Связь записей с людьми
CREATE TABLE entry_people (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role VARCHAR(50),
  notes TEXT,
  UNIQUE(entry_id, person_id)
);

-- 11. Таблица тегов
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 12. Связь записей с тегами
CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- 13. Таблица связей между записями
CREATE TABLE entry_relations (
  id SERIAL PRIMARY KEY,
  from_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (from_entry_id != to_entry_id)
);

-- 14. Таблица навыков (RPG)
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

-- 15. Таблица прогресса навыков
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

-- 16. AI анализ записей
CREATE TABLE ai_analysis (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  analysis_text TEXT NOT NULL,
  symbols_found JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  ai_model_version VARCHAR(50)
);

-- 17. AI генерация изображений
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
-- ВСТАВЛЯЕМ ДАННЫЕ (27 эмоций)
-- ============================================
INSERT INTO emotions (name_en, name_ru, category) VALUES
  ('Admiration', 'Восхищение', 'positive'),
  ('Adoration', 'Обожание', 'positive'),
  ('Aesthetic appreciation', 'Эстетическое наслаждение', 'positive'),
  ('Amusement', 'Веселье', 'positive'),
  ('Anger', 'Гнев', 'negative'),
  ('Anxiety', 'Тревога', 'negative'),
  ('Awe', 'Благоговение', 'neutral'),
  ('Awkwardness', 'Неловкость', 'negative'),
  ('Boredom', 'Скука', 'negative'),
  ('Calmness', 'Спокойствие', 'positive'),
  ('Confusion', 'Замешательство', 'negative'),
  ('Craving', 'Жажда', 'neutral'),
  ('Disgust', 'Отвращение', 'negative'),
  ('Empathic pain', 'Эмпатическая боль', 'negative'),
  ('Entrancement', 'Завороженность', 'neutral'),
  ('Excitement', 'Возбуждение', 'positive'),
  ('Fear', 'Страх', 'negative'),
  ('Horror', 'Ужас', 'negative'),
  ('Interest', 'Интерес', 'neutral'),
  ('Joy', 'Радость', 'positive'),
  ('Nostalgia', 'Ностальгия', 'neutral'),
  ('Relief', 'Облегчение', 'positive'),
  ('Romance', 'Романтика', 'positive'),
  ('Sadness', 'Грусть', 'negative'),
  ('Satisfaction', 'Удовлетворение', 'positive'),
  ('Sexual desire', 'Сексуальное влечение', 'neutral'),
  ('Surprise', 'Удивление', 'neutral')
ON CONFLICT (name_en) DO NOTHING;

-- ============================================
-- СОЗДАЕМ ИНДЕКСЫ
-- ============================================

-- Для users
CREATE INDEX idx_users_login ON users(login);

-- Для circumstances
CREATE INDEX idx_circumstances_user ON circumstances(user_id);
CREATE INDEX idx_circumstances_timestamp ON circumstances(timestamp);

-- Для body_states
CREATE INDEX idx_body_states_user ON body_states(user_id);
CREATE INDEX idx_body_states_timestamp ON body_states(timestamp);
CREATE INDEX idx_body_states_location ON body_states USING GIST(location_point);
CREATE INDEX idx_body_states_circumstance ON body_states(circumstance_id);

-- Для entries
CREATE INDEX idx_entries_user ON entries(user_id);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_entries_created ON entries(created_at);
CREATE INDEX idx_entries_body_state ON entries(body_state_id);
CREATE INDEX idx_entries_circumstance ON entries(circumstance_id);

-- Для entry_emotions
CREATE INDEX idx_entry_emotions_entry ON entry_emotions(entry_id);
CREATE INDEX idx_entry_emotions_emotion ON entry_emotions(emotion_id);

-- Для people
CREATE INDEX idx_people_user ON people(user_id);
CREATE INDEX idx_people_category ON people(category);

-- Для entry_people
CREATE INDEX idx_entry_people_entry ON entry_people(entry_id);
CREATE INDEX idx_entry_people_person ON entry_people(person_id);

-- Для entry_relations
CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type);

-- Для tags
CREATE INDEX idx_tags_user ON tags(user_id);

-- Для entry_tags
CREATE INDEX idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);

-- Для skills
CREATE INDEX idx_skills_user ON skills(user_id);

-- Для skill_progress
CREATE INDEX idx_skill_progress_skill ON skill_progress(skill_id);
CREATE INDEX idx_skill_progress_entry ON skill_progress(entry_id);
CREATE INDEX idx_skill_progress_body ON skill_progress(body_state_id);

-- Для AI таблиц
CREATE INDEX idx_ai_analysis_entry ON ai_analysis(entry_id);
CREATE INDEX idx_ai_images_entry ON ai_images(entry_id);

