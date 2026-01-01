// src/__tests__/setup.ts - исправленная версия
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Server } from 'http';

// Загружаем тестовые переменные окружения
dotenv.config({ path: '.env.test' });

// Устанавливаем тестовое окружение
process.env.NODE_ENV = 'test';

// Глобальная переменная для пула соединений
let testPool: Pool;

// Глобальные таймауты
jest.setTimeout(30000);

// Глобальные хуки
beforeAll(async () => {
  // Отключаем логгер ошибок в тестах
  if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
  }
  // Создаем базу данных если не существует
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    // Проверяем существует ли база
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'dream_journal_test'"
    );
    
    if (dbCheck.rowCount === 0) {
      // console.log('Creating test database...');
      
      // Отключаем активные соединения
      await adminPool.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = 'dream_journal_test' AND pid <> pg_backend_pid()
      `);
      
      // Создаем базу данных
      await adminPool.query(`
        CREATE DATABASE dream_journal_test 
            WITH OWNER = ${process.env.DB_USER}
            ENCODING = 'UTF8'
            LC_COLLATE = 'en_US.UTF-8'
            LC_CTYPE = 'en_US.UTF-8'
            TEMPLATE = template0
      `);
      
      // console.log('Test database created');
    } else {
      // console.log('Test database already exists');
    }
    
    await adminPool.end();
    
    // Создаем подключение к тестовой базе
    testPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'dream_journal_test',
    });
    
    // Применяем полную схему базы данных
    await createFullSchema(testPool);
    
    // console.log('Database schema created successfully');
    
  } catch (error) {
    // console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Создаем полную схему БД
async function createFullSchema(pool: Pool) {
  try {
    // Включаем PostGIS
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis');
    
    // 1. Пользователи
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(128) NOT NULL,
        backup_code_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);

    // 2. Обстоятельства
    await pool.query(`
      CREATE TABLE IF NOT EXISTS circumstances (
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
      )
    `);

    // 3. Состояния тела
    await pool.query(`
      CREATE TABLE IF NOT EXISTS body_states (
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
      )
    `);

    // 4. Записи
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
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
      )
    `);

    // 5. Эмоции
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emotions (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(50) UNIQUE NOT NULL,
        name_ru VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('positive', 'negative', 'neutral')),
        description TEXT
      )
    `);

    // 6. Связь записей с эмоциями
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entry_emotions (
        id SERIAL PRIMARY KEY,
        entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        emotion_id INT REFERENCES emotions(id),
        intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10)
      )
    `);

    // 7. Люди
    await pool.query(`
      CREATE TABLE IF NOT EXISTS people (
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
      )
    `);

    // 8. Связь записей с людьми
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entry_people (
        id SERIAL PRIMARY KEY,
        entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        role VARCHAR(50),
        notes TEXT,
        UNIQUE(entry_id, person_id)
      )
    `);

    // 9. Теги
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, name)
      )
    `);

    // 10. Связь записей с тегами
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entry_tags (
        entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (entry_id, tag_id)
      )
    `);

    // 11. Связи между записями
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entry_relations (
        id SERIAL PRIMARY KEY,
        from_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        to_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        relation_type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        CHECK (from_entry_id != to_entry_id)
      )
    `);

    // Вставляем 27 базовых эмоций (даже если таблица уже существует)
    await insertBaseEmotions(pool);
    
  } catch (error) {
    // console.error('Failed to create database schema:', error);
    throw error;
  }
}

// Вставляем 27 базовых эмоций
async function insertBaseEmotions(pool: Pool) {
  // console.log('Inserting 27 base emotions...');
  
  const emotions = [
    ['Admiration', 'Восхищение', 'positive'],
    ['Adoration', 'Обожаение', 'positive'],
    ['Aesthetic appreciation', 'Эстетическое наслаждение', 'positive'],
    ['Amusement', 'Веселье', 'positive'],
    ['Anger', 'Гнев', 'negative'],
    ['Anxiety', 'Тревога', 'negative'],
    ['Awe', 'Благоговение', 'neutral'],
    ['Awkwardness', 'Неловкость', 'negative'],
    ['Boredom', 'Скука', 'negative'],
    ['Calmness', 'Спокойствие', 'positive'],
    ['Confusion', 'Замешательство', 'negative'],
    ['Craving', 'Жажда', 'neutral'],
    ['Disgust', 'Отвращение', 'negative'],
    ['Empathic pain', 'Эмпатическая боль', 'negative'],
    ['Entrancement', 'Завороженность', 'neutral'],
    ['Excitement', 'Возбуждение', 'positive'],
    ['Fear', 'Страх', 'negative'],
    ['Horror', 'Ужас', 'negative'],
    ['Interest', 'Интерес', 'neutral'],
    ['Joy', 'Радость', 'positive'],
    ['Nostalgia', 'Ностальгия', 'neutral'],
    ['Relief', 'Облегчение', 'positive'],
    ['Romance', 'Романтика', 'positive'],
    ['Sadness', 'Грусть', 'negative'],
    ['Satisfaction', 'Удовлетворение', 'positive'],
    ['Sexual desire', 'Сексуальное влечение', 'neutral'],
    ['Surprise', 'Удивление', 'neutral']
  ];

  let insertedCount = 0;
  
  for (const [name_en, name_ru, category] of emotions) {
    try {
      await pool.query(
        `INSERT INTO emotions (name_en, name_ru, category) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name_en) DO NOTHING`,
        [name_en, name_ru, category]
      );
      insertedCount++;
    } catch (error) {
      // console.warn(`Failed to insert emotion ${name_en}:`, error);
    }
  }
  
  // console.log(`Inserted ${insertedCount} emotions`);
}

// Очистка таблиц в правильном порядке (учитывая foreign keys)
async function clearAllTables() {
  const tables = [
    'ai_images',
    'ai_analysis',
    'skill_progress',
    'skills',
    'entry_relations',
    'entry_tags',
    'tags',
    'entry_people',
    'people',
    'entry_emotions',
    // Не очищаем emotions - они должны оставаться!
    'entries',
    'body_states',
    'circumstances',
    'users'
  ];

  for (const table of tables) {
    try {
      await testPool.query(`DELETE FROM ${table} CASCADE`);
    } catch (error) {
      // Игнорируем ошибки если таблицы не существует
      if (!(error as any).message.includes('does not exist')) {
        // console.warn(`Failed to clear table ${table}:`, error);
      }
    }
  }
}

// очистка перед каждым тестом
beforeEach(async () => {
  await clearAllTables();
});

afterAll(async () => {
  // console.log('Cleaning up test environment...');
  
  // Закрываем соединения с БД
  if (testPool) {
    await testPool.end();
    // console.log('Database connections closed');
  }
});

// Экспортируем пул для использования в тестах
export { testPool };