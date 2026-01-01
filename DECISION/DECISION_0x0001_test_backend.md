ОТЧЁТ: Backend API — Полная Готовность    
Дата: 31 декабря 2025  
Проект: AIM Backend Testing Guide  
Статус: модули реализованы и готовы к тестированию  
  
# AIM Backend Testing Guide

- [Установка](#установка)
- [Структура тестов](#структура-тестов)
- [Запуск тестов](#запуск-тестов)
- [Написание тестов](#написание-тестов)
- [Best Practices](#best-practices)

## Установка

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

###  тестовую базу данных

```bash
# Создать тестовую БД
npm run db:test:setup

# Или вручную
psql -U postgres -c 'CREATE DATABASE dream_journal_test;'
```

###  .env.test

Скопируйте `.env.test.example` в `.env.test` и настройте:

```bash
cp .env.test.example .env.test
```

## Структура тестов

```
src/
├── __tests__/
│   ├── setup.ts              # Глобальная настройка тестов
│   └── run-all-tests.ts      # Запускатель всех тестов
├── modules/
│   ├── auth/
│   │   ├── __tests__/
│   │   │   └── auth.test.ts
│   │   └── ...
│   ├── analytics/
│   │   ├── __tests__/
│   │   │   └── analytics.test.ts
│   │   └── ...
│   └── ...
└── jest.config.js
```

## Запуск тестов

### Все тесты

```bash
# Запустить все тесты
npm test

# Запустить с подробным выводом
npm run test:verbose

# Запустить с покрытием кода
npm run test:coverage

# Запустить последовательно все модули
npm run test:all
```

### Конкретный модуль

```bash
# Только тесты auth
npm run test:auth

# Любой другой модуль
npx jest src/modules/emotions/__tests__
```

### Watch режим

```bash
# Следить за изменениями и перезапускать тесты
npm run test:watch
```

## Написание тестов

### Базовая структура теста

```typescript
import request from 'supertest';
import app from '../../index';
import { pool } from '../../db/pool';

describe('Module Name Tests', () => {
  beforeEach(async () => {
    // Очистка перед каждым тестом
    await pool.query('DELETE FROM table_name WHERE ...');
  });

  afterAll(async () => {
    // Очистка после всех тестов
    await pool.end();
  });

  describe('Feature Group', () => {
    it('should do something specific', async () => {
      const response = await request(app)
        .post('/api/v1/endpoint')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
```

### Тестирование эндпоинтов

```typescript
// GET запрос
const response = await request(app)
  .get('/api/v1/users/1')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);

// POST запрос
const response = await request(app)
  .post('/api/v1/users')
  .send({ name: 'John', email: 'john@example.com' })
  .expect(201);

// PUT запрос
const response = await request(app)
  .put('/api/v1/users/1')
  .send({ name: 'Jane' })
  .expect(200);

// DELETE запрос
const response = await request(app)
  .delete('/api/v1/users/1')
  .expect(204);
```

### Тестирование аутентификации

```typescript
describe('Protected Endpoints', () => {
  let authToken: string;

  beforeEach(async () => {
    // Создать пользователя и получить токен
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        login: 'testuser',
        password: 'Valid-Password-123!'
      });
    
    authToken = response.body.data.token;
  });

  it('should access protected resource with valid token', async () => {
    const response = await request(app)
      .get('/api/v1/protected/resource')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should reject access without token', async () => {
    await request(app)
      .get('/api/v1/protected/resource')
      .expect(401);
  });
});
```

## Best Practices

### Изоляция тестов

Каждый тест должен быть независимым:

```typescript
beforeEach(async () => {
  // Очищайте данные перед каждым тестом
  await cleanupTestData();
});
```

### граничные случаи

```typescript
describe('Input Validation', () => {
  it('should accept minimum valid length');
  it('should accept maximum valid length');
  it('should reject too short input');
  it('should reject too long input');
  it('should reject empty input');
  it('should reject null input');
});
```

### связанные тесты

```typescript
describe('User Registration', () => {
  describe('Success Cases', () => {
    it('should register with valid data');
    it('should generate unique tokens');
  });

  describe('Validation Errors', () => {
    it('should reject invalid email');
    it('should reject weak password');
  });

  describe('Security', () => {
    it('should hash passwords');
    it('should prevent SQL injection');
  });
});
```

### все поля ответа

```typescript
it('should return complete user object', async () => {
  const response = await request(app)
    .get('/api/v1/users/1')
    .expect(200);

  expect(response.body).toMatchObject({
    success: true,
    data: {
      id: expect.any(Number),
      login: expect.any(String),
      created_at: expect.any(String),
    }
  });

  // Проверяем что пароль НЕ возвращается
  expect(response.body.data).not.toHaveProperty('password');
});
```

### асинхронные операции

```typescript
it('should handle async operations', async () => {
  const promise = request(app)
    .post('/api/v1/long-operation')
    .send({ data: 'test' });

  await expect(promise).resolves.toMatchObject({
    body: { success: true }
  });
});
```

### моки для внешних сервисов

```typescript
jest.mock('../../services/EmailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

it('should send email on registration', async () => {
  await request(app)
    .post('/api/v1/auth/register')
    .send({ login: 'test', password: 'Valid-123!' });

  expect(EmailService.sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.any(String),
      subject: expect.stringContaining('Welcome')
    })
  );
});
```

## Coverage Reports

После запуска с `--coverage`, отчеты будут доступны в:

- `coverage/lcov-report/index.html` - HTML отчет
- `coverage/coverage-summary.json` - JSON отчет
- Terminal - Краткий отчет в консоли

Цель: минимум 80% покрытия кода.

## Отладка тестов

```bash
# Запустить конкретный тест
npx jest -t "should register a new user"

# Запустить с детектором открытых соединений
npm run test:verbose

# Запустить один файл
npx jest src/modules/auth/__tests__/auth.test.ts
```

## Troubleshooting

### Тесты не завершаются

```typescript
afterAll(async () => {
  await pool.end(); //  БД
});
```

### Ошибки подключения к БД

Проверьте `.env.test`:
- База данных существует
- Пользователь имеет права доступа
- Порт правильный

### Таймауты

Увеличьте таймаут в `jest.config.js`:

```javascript
testTimeout: 30000,
```

