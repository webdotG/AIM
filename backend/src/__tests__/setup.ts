// src/__tests__/setup.ts — REWRITTEN FOR NEW GRAPH-BASED ARCHITECTURE
// NOTE: .env.test is already loaded by setup-env.ts (setupFiles, runs before imports)
import { Pool } from 'pg';

jest.setTimeout(30000);

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
  }

  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    const dbName = process.env.DB_NAME_TEST || process.env.DB_NAME || 'lifegraph_test';

    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheck.rowCount === 0) {
      await adminPool.query(`
        CREATE DATABASE ${dbName}
        WITH OWNER = ${process.env.DB_USER}
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        TEMPLATE = template0
      `);
    }

    await adminPool.end();

    const testPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5433'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    await createFullSchema(testPool);
    await testPool.end();
  } catch (error) {
    throw error;
  }
});

async function createFullSchema(pool: Pool) {
  // Extensions
  await pool.query('CREATE EXTENSION IF NOT EXISTS postgis');
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  // USERS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      login VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      backup_code_hash VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login TIMESTAMP
    )
  `);

  // NODE TYPES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS node_types (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT
    )
  `);

  // NODES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      node_type_id INT NOT NULL REFERENCES node_types(id),
      title VARCHAR(300),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP
    )
  `);

  // EDGE TYPES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS edge_types (
      id SERIAL PRIMARY KEY,
      code VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT
    )
  `);

  // EDGES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS edges (
      id BIGSERIAL PRIMARY KEY,
      from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      edge_type_id INT NOT NULL REFERENCES edge_types(id),
      confidence NUMERIC(5,4) CHECK (confidence >= 0 AND confidence <= 1),
      weight NUMERIC(8,3) CHECK (weight >= 0),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      notes TEXT,
      deleted_at TIMESTAMP,
      CHECK (from_node_id <> to_node_id)
    )
  `);

  // DREAMS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dreams (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      dream_date TIMESTAMP,
      lucidity SMALLINT CHECK (lucidity BETWEEN 1 AND 10),
      vividness SMALLINT CHECK (vividness BETWEEN 1 AND 10),
      nightmare BOOLEAN DEFAULT FALSE,
      sleep_start TIMESTAMP,
      sleep_end TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);

  // THOUGHTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS thoughts (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      importance SMALLINT CHECK (importance BETWEEN 1 AND 10),
      confidence SMALLINT CHECK (confidence BETWEEN 1 AND 10),
      deleted_at TIMESTAMP
    )
  `);

  // MEMORIES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS memories (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      event_date DATE,
      confidence SMALLINT CHECK (confidence BETWEEN 1 AND 10),
      deleted_at TIMESTAMP
    )
  `);

  // PLANS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plans (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      deadline TIMESTAMP,
      priority SMALLINT CHECK (priority BETWEEN 1 AND 10),
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);

  // ACTIONS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS actions (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      activity_id INT,
      started_at TIMESTAMP,
      finished_at TIMESTAMP,
      description TEXT,
      deleted_at TIMESTAMP
    )
  `);

  // PEOPLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS people (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      full_name VARCHAR(200) NOT NULL,
      nickname VARCHAR(100),
      birth_date DATE,
      relationship VARCHAR(100),
      notes TEXT,
      deleted_at TIMESTAMP
    )
  `);

  // PLACES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS places (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      title VARCHAR(300),
      address TEXT,
      location GEOGRAPHY(POINT, 4326),
      deleted_at TIMESTAMP
    )
  `);

  // PROJECTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      description TEXT,
      started_at TIMESTAMP,
      finished_at TIMESTAMP,
      status VARCHAR(50),
      deleted_at TIMESTAMP
    )
  `);

  // BOOKS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT,
      isbn VARCHAR(30),
      pages INT,
      deleted_at TIMESTAMP
    )
  `);

  // EMOTIONS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS emotions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(60) UNIQUE NOT NULL,
      name_ru VARCHAR(100) NOT NULL,
      name_en VARCHAR(100) NOT NULL,
      category VARCHAR(20) CHECK (category IN ('positive', 'negative', 'neutral'))
    )
  `);

  // NODE EMOTIONS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS node_emotions (
      id BIGSERIAL PRIMARY KEY,
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      emotion_id INT NOT NULL REFERENCES emotions(id),
      intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (node_id, emotion_id)
    )
  `);

  // ACTIVITIES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      parent_id INT REFERENCES activities(id) ON DELETE SET NULL,
      code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      icon VARCHAR(100),
      color VARCHAR(30),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // FK: actions -> activities
  try {
    await pool.query(`
      ALTER TABLE actions ADD CONSTRAINT fk_action_activity
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    `);
  } catch { /* constraint may already exist */ }

  // MEASUREMENT DEFINITIONS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS measurement_definitions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      data_type VARCHAR(20) CHECK (data_type IN ('integer', 'decimal', 'boolean', 'text')),
      default_unit VARCHAR(50),
      min_value DOUBLE PRECISION,
      max_value DOUBLE PRECISION
    )
  `);

  // ACTIVITY MEASUREMENTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_measurements (
      activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      measurement_id INT NOT NULL REFERENCES measurement_definitions(id) ON DELETE CASCADE,
      required BOOLEAN DEFAULT FALSE,
      display_order INT DEFAULT 0,
      PRIMARY KEY (activity_id, measurement_id)
    )
  `);

  // NODE MEASUREMENTS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS node_measurements (
      id BIGSERIAL PRIMARY KEY,
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      measurement_id INT NOT NULL REFERENCES measurement_definitions(id),
      value_integer BIGINT,
      value_decimal DOUBLE PRECISION,
      value_boolean BOOLEAN,
      value_text TEXT,
      unit VARCHAR(50),
      measured_at TIMESTAMP DEFAULT NOW(),
      CHECK (
        (value_integer IS NOT NULL)::INT +
        (value_decimal IS NOT NULL)::INT +
        (value_boolean IS NOT NULL)::INT +
        (value_text    IS NOT NULL)::INT = 1
      )
    )
  `);

  // CHARACTERISTICS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS characteristics (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT
    )
  `);

  // CHARACTERISTIC RULES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS characteristic_rules (
      id SERIAL PRIMARY KEY,
      characteristic_id INT NOT NULL REFERENCES characteristics(id) ON DELETE CASCADE,
      activity_id INT REFERENCES activities(id) ON DELETE CASCADE,
      measurement_id INT REFERENCES measurement_definitions(id) ON DELETE CASCADE,
      weight DOUBLE PRECISION NOT NULL,
      description TEXT
    )
  `);

  // AI ANALYSIS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_analysis (
      id BIGSERIAL PRIMARY KEY,
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE RESTRICT,
      analysis_type VARCHAR(100) NOT NULL,
      ai_model VARCHAR(100),
      prompt TEXT,
      result TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // AI IMAGES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_images (
      id BIGSERIAL PRIMARY KEY,
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE RESTRICT,
      image_url TEXT NOT NULL,
      prompt TEXT,
      metadata JSONB,
      ai_model VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // TAGS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      UNIQUE (user_id, name)
    )
  `);

  // NODE TAGS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS node_tags (
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (node_id, tag_id)
    )
  `);

  // Insert reference data (if not already present)
  await insertReferenceData(pool);

  // Create indexes
  await createIndexes(pool);

  // Create triggers (only if not exist)
  try {
    await pool.query(`
      CREATE OR REPLACE FUNCTION prevent_node_hard_delete()
      RETURNS TRIGGER AS $$
      BEGIN
          RAISE EXCEPTION 'Hard delete on nodes is forbidden. Use UPDATE deleted_at = NOW() instead.';
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION check_node_type_consistency()
      RETURNS TRIGGER AS $$
      DECLARE
          type_code   TEXT;
          target_table TEXT;
          node_exists  BOOLEAN;
      BEGIN
          SELECT nt.code INTO type_code
          FROM node_types nt
          WHERE nt.id = NEW.node_type_id;

          target_table := CASE type_code
              WHEN 'dream'   THEN 'dreams'
              WHEN 'thought' THEN 'thoughts'
              WHEN 'memory'  THEN 'memories'
              WHEN 'plan'    THEN 'plans'
              WHEN 'action'  THEN 'actions'
              WHEN 'person'  THEN 'people'
              WHEN 'place'   THEN 'places'
              WHEN 'project' THEN 'projects'
              WHEN 'book'    THEN 'books'
              ELSE NULL
          END;

          IF target_table IS NULL THEN
              RETURN NEW;
          END IF;

          EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE node_id = $1)', target_table)
              INTO node_exists
              USING NEW.id;

          IF NOT node_exists THEN
              RAISE EXCEPTION 'Node of type "%" must have a record in table "%"', type_code, target_table;
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION check_measurement_type()
      RETURNS TRIGGER AS $$
      DECLARE
          expected_type TEXT;
          measure_name  TEXT;
      BEGIN
          SELECT md.data_type, md.name INTO expected_type, measure_name
          FROM measurement_definitions md
          WHERE md.id = NEW.measurement_id;

          IF expected_type IS NULL THEN
              RAISE EXCEPTION 'Measurement definition id=% not found', NEW.measurement_id;
          END IF;

          CASE expected_type
              WHEN 'integer' THEN
                  IF NEW.value_integer IS NULL THEN
                      RAISE EXCEPTION 'Measurement "%" (id=%) expects value_integer, got NULL', measure_name, NEW.measurement_id;
                  END IF;
              WHEN 'decimal' THEN
                  IF NEW.value_decimal IS NULL THEN
                      RAISE EXCEPTION 'Measurement "%" (id=%) expects value_decimal, got NULL', measure_name, NEW.measurement_id;
                  END IF;
              WHEN 'boolean' THEN
                  IF NEW.value_boolean IS NULL THEN
                      RAISE EXCEPTION 'Measurement "%" (id=%) expects value_boolean, got NULL', measure_name, NEW.measurement_id;
                  END IF;
              WHEN 'text' THEN
                  IF NEW.value_text IS NULL THEN
                      RAISE EXCEPTION 'Measurement "%" (id=%) expects value_text, got NULL', measure_name, NEW.measurement_id;
                  END IF;
              ELSE
                  RAISE EXCEPTION 'Unknown data_type "%" for measurement id=%', expected_type, NEW.measurement_id;
          END CASE;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  } catch { /* functions may already exist */ }

  // Skip hard-delete trigger in test environment to allow cleanup
  await pool.query(`DROP TRIGGER IF EXISTS trg_prevent_node_delete ON nodes`);

  try {
    await pool.query(`DROP TRIGGER IF EXISTS trg_nodes_type_consistency ON nodes`);
    await pool.query(`
      CREATE TRIGGER trg_nodes_type_consistency
          AFTER UPDATE OF node_type_id ON nodes
          FOR EACH ROW
          EXECUTE FUNCTION check_node_type_consistency()
    `);
  } catch { /* triggers may already exist */ }

  try {
    await pool.query(`DROP TRIGGER IF EXISTS trg_measurement_type_check ON node_measurements`);
    await pool.query(`
      CREATE TRIGGER trg_measurement_type_check
          BEFORE INSERT OR UPDATE ON node_measurements
          FOR EACH ROW
          EXECUTE FUNCTION check_measurement_type()
    `);
  } catch { /* triggers may already exist */ }
}

async function insertReferenceData(pool: Pool) {
  // Node types (if not present)
  const nodeTypes = [
    ['dream', 'Dream'], ['thought', 'Thought'], ['memory', 'Memory'],
    ['plan', 'Plan'], ['action', 'Action'], ['person', 'Person'],
    ['place', 'Place'], ['book', 'Book'], ['project', 'Project'],
    ['conversation', 'Conversation'], ['movie', 'Movie'], ['course', 'Course'],
    ['website', 'Website'], ['music', 'Music'], ['article', 'Article'],
  ];

  for (const [code, name] of nodeTypes) {
    await pool.query(
      `INSERT INTO node_types(code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING`,
      [code, name]
    );
  }

  // Edge types (if not present)
  const edgeTypes = [
    ['mentions', 'Mentions'], ['caused', 'Caused'], ['resulted_in', 'Resulted In'],
    ['inspired', 'Inspired'], ['reminded_of', 'Reminded Of'], ['about', 'About'],
    ['contains', 'Contains'], ['performed_with', 'Performed With'],
    ['completed_by', 'Completed By'], ['created', 'Created'],
    ['references', 'References'], ['symbolizes', 'Symbolizes'],
    ['contradicts', 'Contradicts'], ['depends_on', 'Depends On'],
    ['belongs_to', 'Belongs To'], ['related_to', 'Related To'],
  ];

  for (const [code, name] of edgeTypes) {
    await pool.query(
      `INSERT INTO edge_types(code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING`,
      [code, name]
    );
  }

  // Emotions (if not present)
  const emotions = [
    ['admiration', 'Admiration', 'Восхищение', 'positive'],
    ['adoration', 'Adoration', 'Обожание', 'positive'],
    ['aesthetic_appreciation', 'Aesthetic appreciation', 'Эстетическое наслаждение', 'positive'],
    ['amusement', 'Amusement', 'Веселье', 'positive'],
    ['anger', 'Anger', 'Гнев', 'negative'],
    ['anxiety', 'Anxiety', 'Тревога', 'negative'],
    ['awe', 'Awe', 'Благоговение', 'neutral'],
    ['awkwardness', 'Awkwardness', 'Неловкость', 'negative'],
    ['boredom', 'Boredom', 'Скука', 'negative'],
    ['calmness', 'Calmness', 'Спокойствие', 'positive'],
    ['confusion', 'Confusion', 'Замешательство', 'negative'],
    ['craving', 'Craving', 'Жажда', 'neutral'],
    ['disgust', 'Disgust', 'Отвращение', 'negative'],
    ['empathic_pain', 'Empathic pain', 'Эмпатическая боль', 'negative'],
    ['entrancement', 'Entrancement', 'Завороженность', 'neutral'],
    ['excitement', 'Excitement', 'Возбуждение', 'positive'],
    ['fear', 'Fear', 'Страх', 'negative'],
    ['horror', 'Horror', 'Ужас', 'negative'],
    ['interest', 'Interest', 'Интерес', 'neutral'],
    ['joy', 'Joy', 'Радость', 'positive'],
    ['nostalgia', 'Nostalgia', 'Ностальгия', 'neutral'],
    ['relief', 'Relief', 'Облегчение', 'positive'],
    ['romance', 'Romance', 'Романтика', 'positive'],
    ['sadness', 'Sadness', 'Грусть', 'negative'],
    ['satisfaction', 'Satisfaction', 'Удовлетворение', 'positive'],
    ['sexual_desire', 'Sexual desire', 'Сексуальное влечение', 'neutral'],
    ['surprise', 'Surprise', 'Удивление', 'neutral'],
  ];

  for (const [code, nameEn, nameRu, category] of emotions) {
    await pool.query(
      `INSERT INTO emotions(code, name_en, name_ru, category)
       VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`,
      [code, nameEn, nameRu, category]
    );
  }
}

async function createIndexes(pool: Pool) {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_nodes_user ON nodes(user_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(node_type_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_nodes_created ON nodes(created_at) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_nodes_deleted ON nodes(deleted_at) WHERE deleted_at IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(edge_type_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_edges_deleted ON edges(deleted_at) WHERE deleted_at IS NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_node_emotions_node ON node_emotions(node_id)',
    'CREATE INDEX IF NOT EXISTS idx_node_emotions_emotion ON node_emotions(emotion_id)',
    'CREATE INDEX IF NOT EXISTS idx_node_measurements_node ON node_measurements(node_id)',
    'CREATE INDEX IF NOT EXISTS idx_node_measurements_def ON node_measurements(measurement_id)',
    'CREATE INDEX IF NOT EXISTS idx_node_tags_node ON node_tags(node_id)',
    'CREATE INDEX IF NOT EXISTS idx_node_tags_tag ON node_tags(tag_id)',
    'CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_dreams_node ON dreams(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_thoughts_node ON thoughts(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_memories_node ON memories(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_plans_node ON plans(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_actions_node ON actions(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_people_node ON people(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_places_node ON places(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_projects_node ON projects(node_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_books_node ON books(node_id) WHERE deleted_at IS NULL',
  ];

  for (const idx of indexes) {
    try {
      await pool.query(idx);
    } catch { /* ignore index creation errors */ }
  }
}

afterAll(async () => {});