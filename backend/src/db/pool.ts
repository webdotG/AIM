import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Определяем какой .env файл загружать
const getEnvFile = () => {
  // Если NODE_ENV уже установлен (например в setup.ts), используем его
  if (process.env.NODE_ENV === 'test') {
    return '.env.test';
  }
  return '.env';
};

const envFile = getEnvFile();
// console.log(`Loading env file: ${envFile} (NODE_ENV: ${process.env.NODE_ENV})`);

// Загружаем правильный .env файл
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Определяем имя базы данных в зависимости от окружения
const getDatabaseName = () => {
  // console.log(`getDatabaseName - NODE_ENV: ${process.env.NODE_ENV}`);
  // console.log(`DB_NAME: ${process.env.DB_NAME}, DB_NAME_TEST: ${process.env.DB_NAME_TEST}`);
  
  if (process.env.NODE_ENV === 'test') {
    // В тестах используем DB_NAME_TEST или DB_NAME
    return process.env.DB_NAME_TEST || process.env.DB_NAME || 'dream_journal_test';
  }
  return process.env.DB_NAME || 'dream_journal';
};

const requiredEnvVars = [
  'DB_USER', 
  'DB_PASSWORD'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Отсутствуют обязательные переменные окружения:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nСоздайте файл .env в корне проекта');
  process.exit(1);
}

const databaseName = getDatabaseName();

// console.log('Конфигурация базы данных:');
// console.log(`   База данных: ${databaseName}`);
// console.log(`   Пользователь: ${process.env.DB_USER}`);
// console.log(`   Хост: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
// console.log(`   Окружение: ${process.env.NODE_ENV || 'development'}`);

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: databaseName,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Настройки пула соединений
  max: process.env.NODE_ENV === 'test' ? 10 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  
  // SSL только в production
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Мониторинг событий пула
pool.on('connect', () => {
  // console.log(`Установлено новое соединение с базой данных: ${databaseName}`);
});

pool.on('error', (err) => {
  console.error('Ошибка пула соединений:', err.message);
  if (process.env.NODE_ENV === 'test') {
    console.error('Test database error - continuing...');
  }
});

// Функция для тестирования подключения при старте
export const initializeDatabase = async (): Promise<boolean> => {
  // console.log('\nИнициализация подключения к базе данных...');
  
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    
    // console.log('База данных подключена успешно');
    // console.log(`   База данных: ${result.rows[0].db}`);
    // console.log(`   Время сервера: ${result.rows[0].time}`);
    
    return true;
  } catch (error: any) {
    console.error('Не удалось подключиться к базе данных:');
    console.error(`   База данных: ${databaseName}`);
    console.error(`   Ошибка: ${error.message}`);
    
    if (process.env.NODE_ENV === 'test') {
      console.error('Continuing in test mode despite database error');
      return true; // В тестах продолжаем даже при ошибке БД
    }
    return false;
  } finally {
    if (client) client.release();
  }
};
