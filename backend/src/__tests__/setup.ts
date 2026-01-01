// src/__tests__/setup.ts
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Server } from 'http';
import { pool } from '../db/pool'; // ДОБАВЬ ЭТОТ ИМПОРТ

// Загружаем тестовые переменные окружения
dotenv.config({ path: '.env.test' });

// Устанавливаем тестовое окружение
process.env.NODE_ENV = 'test';

// Глобальные переменные
let testServer: Server;

// Глобальные таймауты
jest.setTimeout(30000);

// Глобальные хуки
beforeAll(async () => {
  console.log('Setting up test environment...');
  
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
      console.log('Creating test database...');
      await adminPool.query('CREATE DATABASE dream_journal_test');
      console.log('Test database created');
    } else {
      console.log('Test database already exists');
      
      // ПОДКЛЮЧАЕМСЯ К ТЕСТОВОЙ БД И ОЧИЩАЕМ ДАННЫЕ
      const testPool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'dream_journal_test',
      });
      
      // Полная очистка всех таблиц перед тестами
      await testPool.query('DELETE FROM users');
      // Добавь здесь очистку других таблиц если нужно
      
      await testPool.end();
      console.log('Test database cleaned');
    }
    
    await adminPool.end();
  } catch (error) {
    console.error('Failed to setup test database:', error);
  }
});

// очистка перед каждым тестом
beforeEach(async () => {
  await pool.query('DELETE FROM users');
  console.log('Database cleaned before test');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  
  // Закрываем тестовый сервер если он был запущен
  if (testServer) {
    console.log('Closing test server...');
    await new Promise<void>((resolve, reject) => {
      testServer.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          reject(err);
        } else {
          console.log('Test server closed');
          resolve();
        }
      });
    });
  }
  
  // Закрываем соединения с БД
  await pool.end();
  console.log('Database connections closed');
});

// Экспортируем функцию для установки сервера
export const setTestServer = (server: Server) => {
  testServer = server;
};