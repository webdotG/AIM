-- db/migrations/001_init.sql
-- Запусти этот SQL в pgAdmin или psql

-- 1. Таблица пользователей (МИНИМАЛЬНАЯ)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  backup_code_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Таблица записей
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Таблица эмоций (статические данные)
CREATE TABLE IF NOT EXISTS emotions (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(50) UNIQUE NOT NULL,
  name_ru VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL,
  description TEXT
);

-- 4. Связь записей с эмоциями
CREATE TABLE IF NOT EXISTS entry_emotions (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  emotion_id INT REFERENCES emotions(id),
  intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10)
);

-- 5. Таблица людей
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  relationship VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 6. Связь записей с людьми
CREATE TABLE IF NOT EXISTS entry_people (
  id SERIAL PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role VARCHAR(50),
  UNIQUE(entry_id, person_id)
);

-- 7. Таблица тегов
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 8. Связь записей с тегами
CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- 9. Таблица связей между записями
CREATE TABLE IF NOT EXISTS entry_relations (
  id SERIAL PRIMARY KEY,
  from_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (from_entry_id != to_entry_id)
);

-- ИНДЕКСЫ для производительности
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_entries_user ON entries(user_id);
CREATE INDEX idx_entries_created ON entries(created_at);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_people_user ON people(user_id);
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_entry_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_entry_relations_to ON entry_relations(to_entry_id);

-- Вставка 27 эмоций (из твоего SQL)
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