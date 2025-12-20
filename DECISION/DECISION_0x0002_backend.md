# DECISION_0x0005.md — Backend API архитектура и спецификация

**Версия:** 0x0002  
**Дата:** November 21, 2025  
**Статус:** ПРИНЯТО  

---

backend/
├── src/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   └── utils/
├── tests/
├── scripts/
└── docker-compose.yml

## Оглавление

2. [Архитектура Backend](#архитектура-backend)
3. [Структура проекта](#структура-проекта)
4. [API Endpoints спецификация](#api-endpoints-спецификация)
5. [Middleware](#middleware)
6. [Обработка ошибок](#обработка-ошибок)
7. [Валидация данных](#валидация-данных)
8. [Примеры реализации](#примеры-реализации)
9. [Deployment](#deployment)

---


**API First**
   - OpenAPI/Swagger документация
   - Версионирование API (/api/v1)
   - RESTful 

---

## Архитектура Backend

   - Routes → Controllers → Services → Repositories → DB  
   - Каждый слой — одна ответственность  
   - Легко тестировать и расширять  

### Слои

```
HTTP Request
     ↓
┌─────────────────────────────────────┐
│  Middleware Layer                   │
│  - CORS                             │
│  - Body Parser                      │
│  - Rate Limiter                     │
│  - JWT Verification                 │
│  - Sanitization                     │
│  - Security Logging                 │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Routes Layer                       │
│  - /api/v1/auth                     │
│  - /api/v1/entries                  │
│  - /api/v1/relations                │
│  - /api/v1/emotions                 │
│  - /api/v1/people                   │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Controllers Layer                  │
│  - Валидация request                │
│  - Вызов сервисов                   │
│  - Формирование response            │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Services Layer                     │
│  - Бизнес-логика                    │
│  - Хеширование паролей              │
│  - Граф связей                      │
│  - Статистика                       │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Repositories Layer                 │
│  - SQL запросы                      │
│  - Транзакции                       │
│  - Работа с БД                      │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Database (PostgreSQL)              │
│  - users, entries, relations        │
│  - emotions, people, tags           │
│  - security_logs, app_settings      │
└─────────────────────────────────────┘
```

---

## Структура проекта

```
backend/
├── src/
│   ├── config/                     # Конфигурация
│   │   ├── database.js             # Подключение к PostgreSQL
│   │   ├── jwt.js                  # Настройки JWT
│   │   ├── cors.js                 # CORS настройки
│   │   └── env.js                  # Переменные окружения
│   │
│   ├── db/                         # База данных
│   │   ├── pool.js                 # Connection pool
│   │   ├── migrations/             # Миграции (001-017)
│   │   └── seeds/                  # Начальные данные
│   │       ├── emotions.js         # 27 эмоций
│   │       └── relation_types.js   # Типы связей
│   │
│   ├── middleware/                 # Middleware
│   │   ├── auth.middleware.js      # JWT проверка
│   │   ├── sanitize.middleware.js  # Санитизация входящих данных
│   │   ├── rateLimiter.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── logger.middleware.js
│   │   └── validator.middleware.js
│   │
│   ├── routes/                     # Маршруты
│   │   ├── index.js                # Главный роутер
│   │   ├── auth.routes.js          # /api/v1/auth
│   │   ├── entries.routes.js       # /api/v1/entries
│   │   ├── relations.routes.js     # /api/v1/relations
│   │   ├── emotions.routes.js      # /api/v1/emotions
│   │   ├── people.routes.js        # /api/v1/people
│   │   ├── tags.routes.js          # /api/v1/tags
│   │   └── analytics.routes.js     # /api/v1/analytics
│   │
│   ├── controllers/                # Контроллеры
│   │   ├── auth.controller.js
│   │   ├── entries.controller.js
│   │   ├── relations.controller.js
│   │   ├── emotions.controller.js
│   │   ├── people.controller.js
│   │   └── analytics.controller.js
│   │
│   ├── services/                   # Бизнес-логика
│   │   ├── auth.service.js         # Аутентификация + хеширование
│   │   ├── entry.service.js        # Работа с записями
│   │   ├── relation.service.js     # Граф связей
│   │   ├── analytics.service.js    # Статистика
│   │   └── security.service.js     # Security логирование
│   │
│   ├── repositories/               # Доступ к БД
│   │   ├── base.repository.js      # Базовый класс
│   │   ├── users.repository.js
│   │   ├── entries.repository.js
│   │   ├── relations.repository.js
│   │   ├── emotions.repository.js
│   │   ├── people.repository.js
│   │   └── securityLogs.repository.js
│   │
│   ├── validators/                 # Схемы валидации (Joi/Zod)
│   │   ├── auth.validator.js
│   │   ├── entry.validator.js
│   │   └── relation.validator.js
│   │
│   ├── utils/                      # Утилиты
│   │   ├── passwordHasher.js       # Pepper + Bcrypt + Argon2
│   │   ├── backupCodeHasher.js     # Backup-код
│   │   ├── jwtHelper.js            # Работа с JWT
│   │   ├── errorHandler.js
│   │   └── logger.js               # Winston logger
│   │
│   └── app.js                      # Главный файл Express
│
├── tests/                          # Тесты
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                        # Скрипты
│   ├── migrate.js                  # Запуск миграций
│   └── seed.js                     # Загрузка начальных данных
│
├── .env.example                    # Пример переменных окружения
├── .eslintrc.js
├── package.json
└── README.md
```

---

## API Endpoints спецификация

### Base URL

```
Production:  https://api.example.com/api/v1
Development: http://localhost:3000/api/v1
```

---

### 1. Authentication

#### POST /auth/register
**Регистрация нового пользователя**

**Request:**
```json
{
  "login": "anonymous_user_123",
  "password": "StrongPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "backup_code": "Господи Спаси и Сохрани",
    "user": {
      "id": 123,
      "login": "anonymous_user_123",
      "created_at": "2025-11-21T10:30:00Z"
    }
  }
}
```

**Errors:**
- `400` - Validation error (login уже занят, слабый пароль)
- `500` - Server error

---

#### POST /auth/login
**Вход в систему**

**Request:**
```json
{
  "login": "anonymous_user_123",
  "password": "StrongPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 123,
      "login": "anonymous_user_123"
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `429` - Too many login attempts (rate limited)

---

#### POST /auth/recover
**Восстановление пароля через backup-код**

**Request:**
```json
{
  "login": "anonymous_user_123",
  "backup_code": "Господи Спаси и Сохрани",
  "new_password": "В этот раз точно запомгю сто проц !;"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "backup_code": "Господи Спаси и Сохрани Ещё Раз",
    "message": "Password updated successfully"
  }
}
```

**Errors:**
- `401` - Invalid backup code
- `400` - Validation error

---

### 2. Entries

#### GET /entries
**Получить все записи пользователя**

**Headers:**
```
Authorization: Bearer <token>
```

**Query params:**
```
?type=dream              # Фильтр по типу
&page=1                  # Пагинация
&limit=50                # Количество на странице
&search=полет            # Поиск по тексту
&from=2025-01-01         # Дата от
&to=2025-12-31           # Дата до
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid-123",
        "user_id": 123,
        "entry_type": "dream",
        "content": "Мне снилось что я лечу...",
        "event_date": "2025-11-20T00:00:00Z",
        "created_at": "2025-11-21T10:30:00Z",
        "updated_at": "2025-11-21T10:30:00Z",
        "emotions": [
          {
            "emotion_id": 1,
            "name_ru": "Радость",
            "intensity": 8
          }
        ],
        "people": [
          {
            "person_id": 5,
            "name": "Брат",
            "role": "main_character"
          }
        ],
        "relations_count": {
          "incoming": 2,
          "outgoing": 1
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 156,
      "totalPages": 4
    }
  }
}
```

---

#### GET /entries/:id
**Получить запись по ID**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "entry_type": "dream",
    "content": "Мне снилось...",
    "event_date": "2025-11-20T00:00:00Z",
    "created_at": "2025-11-21T10:30:00Z",
    "emotions": [...],
    "people": [...],
    "tags": [...],
    "relations": {
      "incoming": [...],
      "outgoing": [...]
    }
  }
}
```

**Errors:**
- `404` - Entry not found
- `403` - Not authorized to view this entry

---

#### POST /entries
**Создать новую запись**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "entry_type": "dream",
  "content": "Мне снилось что я лечу над городом...",
  "event_date": "2025-11-20",
  "emotions": [
    {
      "emotion_id": 1,
      "intensity": 8
    },
    {
      "emotion_id": 7,
      "intensity": 9
    }
  ],
  "people": [
    {
      "person_id": 5,
      "role": "main_character"
    }
  ],
  "tags": [1, 3, 5]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "entry_type": "dream",
    "content": "Мне снилось что я лечу над городом...",
    "created_at": "2025-11-21T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

---

#### PUT /entries/:id
**Обновить запись**

**Request:**
```json
{
  "content": "Обновленный текст...",
  "is_completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "updated_at": "2025-11-21T11:00:00Z"
  }
}
```

---

#### DELETE /entries/:id
**Удалить запись**

**Response (200):**
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

---

#### GET /entries/search
**Поиск по тексту**

**Query params:**
```
?q=полет&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid-123",
        "entry_type": "dream",
        "content": "Мне снилось что я лечу...",
        "highlight": "...снилось что я <mark>лечу</mark>..."
      }
    ]
  }
}
```

---

### 3. Relations

#### GET /entries/:id/relations
**Получить связи для записи**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "incoming": [
      {
        "id": 1,
        "from_entry_id": "uuid-B",
        "to_entry_id": "uuid-A",
        "relation_type": {
          "id": 1,
          "name": "reminded_of",
          "description": "Напомнило о"
        },
        "description": "Сон напомнил о детстве",
        "created_at": "2025-11-21T10:30:00Z",
        "from_entry": {
          "id": "uuid-B",
          "entry_type": "memory",
          "content": "Вспомнил как в детстве..."
        }
      }
    ],
    "outgoing": [...]
  }
}
```

---

#### POST /relations
**Создать связь между записями**

**Request:**
```json
{
  "from_entry_id": "uuid-A",
  "to_entry_id": "uuid-B",
  "relation_type_id": 1,
  "description": "Сон напомнил о детстве"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_entry_id": "uuid-A",
    "to_entry_id": "uuid-B",
    "relation_type_id": 1,
    "created_at": "2025-11-21T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Validation error (self-reference, cycle warning)
- `404` - Entry not found

---

#### DELETE /relations/:id
**Удалить связь**

**Response (200):**
```json
{
  "success": true,
  "message": "Relation deleted successfully"
}
```

---

#### GET /entries/:id/chain
**Получить цепочку связей (граф)**

**Query params:**
```
?depth=10    # Максимальная глубина
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chain": [
      {
        "id": "uuid-A",
        "entry_type": "dream",
        "content": "Летал над городом",
        "depth": 0,
        "relation_type": null
      },
      {
        "id": "uuid-B",
        "entry_type": "memory",
        "content": "Вспомнил детство",
        "depth": 1,
        "relation_type": "reminded_of"
      }
    ],
    "total_depth": 2,
    "has_cycles": false
  }
}
```

---

#### GET /relation-types
**Получить типы связей**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "reminded_of",
      "description": "Напомнило о",
      "is_active": true
    },
    {
      "id": 2,
      "name": "led_to",
      "description": "Привело к",
      "is_active": true
    }
  ]
}
```

---

### 4. Emotions

#### GET /emotions
**Получить все эмоции**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_en": "Admiration",
      "name_ru": "Восхищение",
      "category": "positive",
      "description": ""
    }
  ]
}
```

---

#### POST /entries/:id/emotions
**Добавить эмоции к записи**

**Request:**
```json
{
  "emotions": [
    {
      "emotion_id": 1,
      "intensity": 8
    },
    {
      "emotion_category": "positive",
      "intensity": 7
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Emotions attached successfully"
}
```

---

### 5. People

#### GET /people
**Получить всех людей пользователя**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Мама",
      "category": "family",
      "relationship": "мать",
      "mention_count": 47
    }
  ]
}
```

---

#### POST /people
**Создать профиль человека**

**Request:**
```json
{
  "name": "Старый друг",
  "category": "friends",
  "relationship": "одноклассник",
  "bio": "Учились вместе в школе"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "name": "Старый друг",
    "created_at": "2025-11-21T10:30:00Z"
  }
}
```

---

### 6. Analytics

#### GET /analytics/statistics
**Получить общую статистику**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_entries": 156,
    "by_type": {
      "dream": 45,
      "memory": 32,
      "thought": 60,
      "plan": 19
    },
    "by_month": {
      "2025-11": 23,
      "2025-10": 34
    },
    "emotions": {
      "most_common": [
        {
          "emotion": "Радость",
          "count": 67
        }
      ],
      "positive_ratio": 0.65
    },
    "completed_plans": 12,
    "overdue_plans": 3
  }
}
```

---

#### GET /analytics/emotions-timeline
**График эмоций по времени**

**Query params:**
```
?from=2025-01-01&to=2025-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "date": "2025-11-01",
        "emotions": {
          "joy": 8.5,
          "sadness": 3.2
        }
      }
    ]
  }
}
```

---

## Middleware

### 1. Authentication Middleware

```javascript
// middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем user_id в request
    req.userId = decoded.user_id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
```

---

### 2. Sanitization Middleware

```javascript
// middleware/sanitize.middleware.js

import SQLSanitizer from '../utils/sanitizers/SQLSanitizer.js';
import TrimSanitizer from '../utils/sanitizers/TrimSanitizer.js';

const sqlSanitizer = new SQLSanitizer();
const trimSanitizer = new TrimSanitizer();

export const sanitizeInputs = async (req, res, next) => {
  try {
    if (req.body) {
      req.body = await sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = await sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
    });
  }
};

async function sanitizeObject(obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      let sanitized = trimSanitizer.sanitize(value);
      sanitized = sqlSanitizer.sanitize(sanitized);
      result[key] = sanitized;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}
```

---

### 3. Rate Limiter Middleware

```javascript
// middleware/rateLimiter.middleware.js

import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import securityLogsRepo from '../repositories/securityLogs.repository.js';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов на пользователя
  
  // Лимит по user_id, не по IP
  keyGenerator: (req) => {
    return req.userId?.toString() || 'anonymous';
  },
  
  handler: async (req, res) => {
    const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
    
    await securityLogsRepo.create({
      user_id: req.userId || null,
      event_type: 'rate_limit_exceeded',
      severity: 'medium',
      description: 'Too many requests',
      ip_hash: ipHash
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
});

// Строгий лимит для auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Только 5 попыток входа
  keyGenerator: (req) => req.body?.login || 'anonymous'
});
```

---

### 4. Error Handler Middleware

```javascript
// middleware/errorHandler.middleware.js

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Ошибка валидации (Joi/Zod)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details
    });
  }
  
  // Ошибка БД
  if (err.code && err.code.startsWith('23')) { // PostgreSQL constraint errors
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation'
    });
  }
  
  // Дефолтная ошибка
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

---

## Обработка ошибок

### Централизованный обработчик

```javascript
// utils/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export { AppError, ValidationError, UnauthorizedError, NotFoundError };
```

---

## Валидация данных

### Schemas (Zod)

```javascript
// validators/auth.validator.js

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    login: z.string()
      .min(3, 'Login must be at least 3 characters')
      .max(50, 'Login must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Login can only contain letters, numbers, underscore and dash'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/\d/, 'Password must contain number')
  })
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string().min(1),
    password: z.string().min(1)
  })
});
```

---

### Middleware для валидации

```javascript
// middleware/validator.middleware.js

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors
    });
  }
};
```

---

## Примеры реализации

### Auth Controller

```javascript
// controllers/auth.controller.js

import authService from '../services/auth.service.js';
import { ValidationError } from '../utils/errorHandler.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { login, password } = req.body;
      
      const result = await authService.register(login, password);
      
      res.status(201).json({
        success: true,
        data: {
          token: result.token,
          backup_code: result.backupCode,
          user: {
            id: result.user.id,
            login: result.user.login,
            created_at: result.user.created_at
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      const { login, password } = req.body;
      
      const result = await authService.login(login, password);
      
      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          user: {
            id: result.user.id,
            login: result.user.login
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async recover(req, res, next) {
    try {
      const { login, backup_code, new_password } = req.body;
      
      const result = await authService.recover(login, backup_code, new_password);
      
      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          backup_code: result.backupCode,
          message: 'Password updated successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
```

---

### Auth Service

```javascript
// services/auth.service.js

import usersRepository from '../repositories/users.repository.js';
import PasswordHasher from '../utils/passwordHasher.js';
import BackupCodeHasher from '../utils/backupCodeHasher.js';
import jwtHelper from '../utils/jwtHelper.js';
import { UnauthorizedError, ValidationError } from '../utils/errorHandler.js';

class AuthService {
  async register(login, password) {
    // Проверяем, существует ли пользователь
    const existingUser = await usersRepository.findByLogin(login);
    
    if (existingUser) {
      throw new ValidationError('Login already taken');
    }
    
    // Хешируем пароль (Pepper + Bcrypt + Argon2)
    const passwordHash = await PasswordHasher.hash(password);
    
    // Генерируем backup-код
    const backupCode = BackupCodeHasher.generate();
    const backupCodeHash = await BackupCodeHasher.hash(backupCode);
    
    // Создаем пользователя
    const user = await usersRepository.create({
      login,
      password_hash: passwordHash,
      backup_code_hash: backupCodeHash
    });
    
    // Генерируем JWT токен
    const token = jwtHelper.generateToken({ user_id: user.id });
    
    return {
      token,
      backupCode, // ВАЖНО: возвращаем только один раз!
      user
    };
  }
  
  async login(login, password) {
    // Находим пользователя
    const user = await usersRepository.findByLogin(login);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Проверяем пароль
    const isValid = await PasswordHasher.verify(password, user.password_hash);
    
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Обновляем last_login
    await usersRepository.updateLastLogin(user.id);
    
    // Генерируем токен
    const token = jwtHelper.generateToken({ user_id: user.id });
    
    return { token, user };
  }
  
  async recover(login, backupCode, newPassword) {
    // Находим пользователя
    const user = await usersRepository.findByLogin(login);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Проверяем backup-код
    const isValid = await BackupCodeHasher.verify(backupCode, user.backup_code_hash);
    
    if (!isValid) {
      throw new UnauthorizedError('Invalid backup code');
    }
    
    // Хешируем новый пароль
    const newPasswordHash = await PasswordHasher.hash(newPassword);
    
    // Генерируем НОВЫЙ backup-код
    const newBackupCode = BackupCodeHasher.generate();
    const newBackupCodeHash = await BackupCodeHasher.hash(newBackupCode);
    
    // Обновляем пользователя
    await usersRepository.update(user.id, {
      password_hash: newPasswordHash,
      backup_code_hash: newBackupCodeHash
    });
    
    // Генерируем токен
    const token = jwtHelper.generateToken({ user_id: user.id });
    
    return {
      token,
      backupCode: newBackupCode,
      user
    };
  }
}

export default new AuthService();
```

---

### Entries Controller

```javascript
// controllers/entries.controller.js

import entryService from '../services/entry.service.js';
import { NotFoundError } from '../utils/errorHandler.js';

class EntriesController {
  async getAll(req, res, next) {
    try {
      const { type, page = 1, limit = 50, search, from, to } = req.query;
      const userId = req.userId;
      
      const filters = {
        user_id: userId,
        type,
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        from,
        to
      };
      
      const result = await entryService.getAll(filters);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const entry = await entryService.getById(id, userId);
      
      if (!entry) {
        throw new NotFoundError('Entry not found');
      }
      
      res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }
  
  async create(req, res, next) {
    try {
      const userId = req.userId;
      const { entry_type, content, event_date, deadline, emotions, people, tags } = req.body;
      
      const entryData = {
        user_id: userId,
        entry_type,
        content,
        event_date,
        deadline
      };
      
      const entry = await entryService.create(entryData, emotions, people, tags);
      
      res.status(201).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }
  
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updates = req.body;
      
      const entry = await entryService.update(id, userId, updates);
      
      res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      await entryService.delete(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Entry deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async search(req, res, next) {
    try {
      const { q, limit = 20 } = req.query;
      const userId = req.userId;
      
      const results = await entryService.search(userId, q, parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: { results }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EntriesController();
```

---

### Entry Service

```javascript
// services/entry.service.js

import entriesRepository from '../repositories/entries.repository.js';
import emotionsRepository from '../repositories/emotions.repository.js';
import peopleRepository from '../repositories/people.repository.js';
import tagsRepository from '../repositories/tags.repository.js';
import relationsRepository from '../repositories/relations.repository.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

class EntryService {
  async getAll(filters) {
    const { page, limit, ...otherFilters } = filters;
    
    const offset = (page - 1) * limit;
    
    const [entries, total] = await Promise.all([
      entriesRepository.findAll(otherFilters, limit, offset),
      entriesRepository.count(otherFilters)
    ]);
    
    // Загружаем связанные данные для каждой записи
    const enrichedEntries = await Promise.all(
      entries.map(entry => this.enrichEntry(entry))
    );
    
    return {
      entries: enrichedEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getById(id, userId) {
    const entry = await entriesRepository.findById(id);
    
    if (!entry) {
      throw new NotFoundError('Entry not found');
    }
    
    // Проверяем права доступа
    if (entry.user_id !== userId) {
      throw new NotFoundError('Entry not found');
    }
    
    return await this.enrichEntry(entry);
  }
  
  async create(entryData, emotions = [], people = [], tags = []) {
    // Валидация
    this.validateEntryData(entryData);
    
    // Используем транзакцию
    const entry = await entriesRepository.transaction(async (client) => {
      // 1. Создаем запись
      const newEntry = await entriesRepository.create(entryData, client);
      
      // 2. Добавляем эмоции
      if (emotions.length > 0) {
        await emotionsRepository.attachToEntry(newEntry.id, emotions, client);
      }
      
      // 3. Добавляем людей
      if (people.length > 0) {
        await peopleRepository.attachToEntry(newEntry.id, people, client);
      }
      
      // 4. Добавляем теги
      if (tags.length > 0) {
        await tagsRepository.attachToEntry(newEntry.id, tags, client);
      }
      
      return newEntry;
    });
    
    return await this.getById(entry.id, entryData.user_id);
  }
  
  async update(id, userId, updates) {
    const entry = await this.getById(id, userId);
    
    // Валидация обновлений
    if (updates.content !== undefined) {
      if (!updates.content || updates.content.trim().length === 0) {
        throw new ValidationError('Content cannot be empty');
      }
    }
    
    const updatedEntry = await entriesRepository.update(id, updates);
    
    return await this.getById(id, userId);
  }
  
  async delete(id, userId) {
    const entry = await this.getById(id, userId);
    
    // ON DELETE CASCADE удалит все связи автоматически
    await entriesRepository.delete(id);
  }
  
  async search(userId, query, limit) {
    return await entriesRepository.fullTextSearch(userId, query, limit);
  }
  
  /**
   * Обогатить запись связанными данными
   */
  async enrichEntry(entry) {
    const [emotions, people, tags, relations] = await Promise.all([
      emotionsRepository.getForEntry(entry.id),
      peopleRepository.getForEntry(entry.id),
      tagsRepository.getForEntry(entry.id),
      relationsRepository.getForEntry(entry.id)
    ]);
    
    return {
      ...entry,
      emotions,
      people,
      tags,
      relations
    };
  }
  
  validateEntryData(data) {
    if (!data.entry_type) {
      throw new ValidationError('Entry type is required');
    }
    
    if (!['dream', 'memory', 'thought', 'plan'].includes(data.entry_type)) {
      throw new ValidationError('Invalid entry type');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError('Content is required');
    }
    
    if (data.entry_type === 'plan' && !data.deadline) {
      throw new ValidationError('Plan must have a deadline');
    }
  }
}

export default new EntryService();
```

---

### Entries Repository

```javascript
// repositories/entries.repository.js

import pool from '../db/pool.js';
import BaseRepository from './base.repository.js';

class EntriesRepository extends BaseRepository {
  constructor() {
    super('entries');
  }
  
  async findAll(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT * FROM entries
      WHERE user_id = $1
    `;
    
    const params = [filters.user_id];
    let paramIndex = 2;
    
    // Фильтр по типу
    if (filters.type) {
      query += ` AND entry_type = ${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }
    
    // Фильтр по дате
    if (filters.from) {
      query += ` AND created_at >= ${paramIndex}`;
      params.push(filters.from);
      paramIndex++;
    }
    
    if (filters.to) {
      query += ` AND created_at <= ${paramIndex}`;
      params.push(filters.to);
      paramIndex++;
    }
    
    // Сортировка
    query += ` ORDER BY created_at DESC`;
    
    // Пагинация
    query += ` LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM entries WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  async create(data, client = pool) {
    const result = await client.query(
      `INSERT INTO entries (user_id, entry_type, content, event_date, deadline, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.user_id,
        data.entry_type,
        data.content,
        data.event_date || null,
        data.deadline || null,
        data.is_completed || false
      ]
    );
    return result.rows[0];
  }
  
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE entries
      SET ${fields.join(', ')}
      WHERE id = ${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  async delete(id) {
    await pool.query('DELETE FROM entries WHERE id = $1', [id]);
  }
  
  async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM entries WHERE user_id = $1';
    const params = [filters.user_id];
    let paramIndex = 2;
    
    if (filters.type) {
      query += ` AND entry_type = ${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
  
  async fullTextSearch(userId, query, limit = 20) {
    const result = await pool.query(
      `SELECT 
         id,
         entry_type,
         content,
         ts_headline('russian', content, plainto_tsquery('russian', $2)) as highlight,
         ts_rank(to_tsvector('russian', content), plainto_tsquery('russian', $2)) as rank
       FROM entries
       WHERE user_id = $1
         AND to_tsvector('russian', content) @@ plainto_tsquery('russian', $2)
       ORDER BY rank DESC
       LIMIT $3`,
      [userId, query, limit]
    );
    
    return result.rows;
  }
  
  /**
   * Транзакция
   */
  async transaction(callback) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new EntriesRepository();
```

---

### Relations Service

```javascript
// services/relation.service.js

import relationsRepository from '../repositories/relations.repository.js';
import entriesRepository from '../repositories/entries.repository.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

class RelationService {
  async getForEntry(entryId, userId) {
    // Проверяем права доступа
    const entry = await entriesRepository.findById(entryId);
    
    if (!entry || entry.user_id !== userId) {
      throw new NotFoundError('Entry not found');
    }
    
    return await relationsRepository.getForEntry(entryId);
  }
  
  async create(fromEntryId, toEntryId, relationTypeId, userId, description = '') {
    // Валидация
    if (fromEntryId === toEntryId) {
      throw new ValidationError('Entry cannot be related to itself');
    }
    
    // Проверяем, что обе записи принадлежат пользователю
    const [fromEntry, toEntry] = await Promise.all([
      entriesRepository.findById(fromEntryId),
      entriesRepository.findById(toEntryId)
    ]);
    
    if (!fromEntry || fromEntry.user_id !== userId) {
      throw new NotFoundError('From entry not found');
    }
    
    if (!toEntry || toEntry.user_id !== userId) {
      throw new NotFoundError('To entry not found');
    }
    
    // Создаем связь
    return await relationsRepository.create({
      from_entry_id: fromEntryId,
      to_entry_id: toEntryId,
      relation_type_id: relationTypeId,
      description
    });
  }
  
  async delete(relationId, userId) {
    const relation = await relationsRepository.findById(relationId);
    
    if (!relation) {
      throw new NotFoundError('Relation not found');
    }
    
    // Проверяем права доступа
    const entry = await entriesRepository.findById(relation.from_entry_id);
    
    if (!entry || entry.user_id !== userId) {
      throw new NotFoundError('Relation not found');
    }
    
    await relationsRepository.delete(relationId);
  }
  
  async getChain(entryId, userId, maxDepth = 5) {
    // Проверяем права доступа
    const entry = await entriesRepository.findById(entryId);
    
    if (!entry || entry.user_id !== userId) {
      throw new NotFoundError('Entry not found');
    }
    
    // Получаем цепочку через рекурсивный CTE
    const chain = await relationsRepository.getChain(entryId, maxDepth);
    
    return {
      chain,
      total_depth: chain.length > 0 ? Math.max(...chain.map(e => e.depth)) : 0,
      has_cycles: this.detectCycles(chain)
    };
  }
  
  async getRelationTypes() {
    return await relationsRepository.getRelationTypes();
  }
  
  detectCycles(chain) {
    const visited = new Set();
    
    for (const entry of chain) {
      if (visited.has(entry.id)) {
        return true;
      }
      visited.add(entry.id);
    }
    
    return false;
  }
}

export default new RelationService();
```

---

## Deployment

### Docker

#### Dockerfile

```dockerfile
# Dockerfile

FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Expose порт
EXPOSE 3000

# Запуск
CMD ["node", "src/app.js"]
```

---

#### docker-compose.yml не актуально но не удаляю чтоб не забыть обновить 

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: psychology_app
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      PASSWORD_PEPPER: ${PASSWORD_PEPPER}
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

volumes:
  postgres_data:
```

---

### Environment Variables

```bash
# .env.production

NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user
DB_PASSWORD=user-pass

# JWT
JWT_SECRET=GENERATE_RANDOM_64_CHARS_HERE
JWT_EXPIRES_IN=24h

# Security
PASSWORD_PEPPER=GENERATE_RANDOM_64_CHARS_HERE
BCRYPT_ROUNDS=12
ARGON2_MEMORY=65536
ARGON2_TIME=3
ARGON2_PARALLELISM=4

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

# CORS
CORS_ORIGIN=https://my-domain.com

# Logging
LOG_LEVEL=info
```

---

### Nginx на минималках

```nginx
# /etc/nginx/sites-available/api

server {
    listen 80;
    server_name api.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## Следующие шаги

### Этап 1: Инициализация Backend
- [ ] Создать структуру папок
- [ ] Настроить package.json
- [ ] Установить зависимости (Express, PostgreSQL, JWT, Bcrypt, Argon2)
- [ ] Настроить ESLint + Prettier

### Этап 2: Database
- [ ] Создать миграции (001-017 из DECISION_0x0002)
- [ ] Создать seeds (emotions, relation_types)
- [ ] Настроить connection pool
- [ ] Написать скрипт migrate.js

### Этап 3: Core слой
- [ ] Реализовать Repositories (Users, Entries, Relations)
- [ ] Реализовать Services (Auth, Entry, Relation)
- [ ] Реализовать PasswordHasher (из DECISION_0x0003)
- [ ] Написать unit тесты

### Этап 4: API слой
- [ ] Реализовать Controllers
- [ ] Настроить Routes
- [ ] Реализовать Middleware (auth, sanitize, rate limit)
- [ ] Настроить валидацию (Zod)

### Этап 5: Security
- [ ] Интеграция санитайзеров (из DECISION_0x0003)
- [ ] Security логирование
- [ ] Rate limiting
- [ ] CORS настройки

### Этап 6: Тестирование
- [ ] Unit тесты для Services
- [ ] Integration тесты для API
- [ ] E2E тесты
- [ ] Load testing

### Этап 7: Deployment
- [ ] Docker setup
- [ ] CI/CD (GitHub Actions)
- [ ] Nginx конфигурация
- [ ] SSL сертификаты (Let's Encrypt)
- [ ] Мониторинг (PM2, Datadog)

---

## Changelog

### 0x0002 (2025-11-21)
- Спроектирована архитектура Backend (4 слоя)
- Полная спецификация API endpoints
- Реализованы примеры Controllers, Services, Repositories
- Настроены Middleware (auth, sanitize, rate limit, error handler)
- Интеграция с Security (многослойное хеширование, санитайзеры)
- Валидация через Zod
- Docker + docker-compose конфигурация
- Nginx конфигурация
- Environment variables
- Стратегия deployment

---

*Совет постановил*