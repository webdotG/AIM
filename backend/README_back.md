# Backend — Life Graph Engine

> Универсальный движок хранения и анализа жизненного опыта человека.
> Графовая модель: узлы (события, сущности), ребра (связи), вычисляемые интерпретации.
>
> Полная документация API: [API_REFERENCE.md](./API_REFERENCE.md)

## Статус

| Параметр | Значение |
|----------|----------|
| Architecture | Graph Architecture V3 |
| API Version | v1 |
| Tests | 354 passed, 13 suites |

---

## Архитектурные принципы

### 1. Факты ≠ Интерпретации

Проект хранит только **факты**: Dream, Memory, Thought, Action, Measurement, Emotion, Edge.

**Интерпретации** вычисляются поверх графа: Discipline, Creativity, Empathy — не хранятся, а вычисляются. По мере развития алгоритмов эти вычисления могут изменяться без изменения пользовательских данных.

### 2. Факты неизменяемы

- `deleted_at` вместо `DELETE` — история сохраняется
- PostgreSQL триггеры запрещают физическое удаление узлов
- AI-анализ защищён от каскадного удаления (`ON DELETE RESTRICT`)

---

## Stack

- **Runtime:** Node.js 20, TypeScript 5
- **Framework:** Express.js
- **Database:** PostgreSQL + PostGIS + pgcrypto
- **Cache:** Redis (JWT blacklist, rate limiting, reference data)
- **Security:** Helmet, CORS, rate limiting, input sanitization
- **Testing:** Jest (unit, integration, e2e)

---

## Установка

```bash
git clone <repo>
cd backend
npm ci
cp .env.example .env
npm run db:test:up    # PostGIS + Redis
npm run migrate
npm run dev
```

### Переменные окружения

```bash
DB_USER=...
DB_PASSWORD=...
DB_NAME=lifegraph
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379

JWT_SECRET=...
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:8000

HCAPTCHA_SECRET=...
```

---

## API Endpoints

### Граф (core)
| Method | Path | Auth | Описание |
|--------|------|------|----------|
| GET | `/graph/node-types` | ✅ | Справочник типов узлов |
| GET | `/graph/edge-types` | ✅ | Справочник типов связей |
| GET | `/graph/nodes` | ✅ | Узлы (тип, фильтр, поиск) |
| POST | `/graph/nodes` | ✅ | Создать узел |
| PUT | `/graph/nodes/:id` | ✅ | Обновить заголовок |
| DELETE | `/graph/nodes/:id` | ✅ | Мягкое удаление |
| POST | `/graph/edges` | ✅ | Создать связь |
| GET | `/graph/edges/node/:nodeId` | ✅ | Связи узла |
| GET | `/graph/traversal/:nodeId` | ✅ | Обход графа |
| GET | `/graph/graph-data` | ✅ | Полный граф |
| GET | `/graph/most-connected` | ✅ | Самые связанные узлы |

### Записи (5 типов узлов)
| Endpoint | Auth | Атрибуты |
|----------|------|----------|
| CRUD `/dreams` | ✅ | lucidity, vividness, nightmare |
| CRUD `/thoughts` | ✅ | importance, confidence |
| CRUD `/memories` | ✅ | event_date, confidence |
| CRUD `/plans` | ✅ | deadline, priority, completed |
| CRUD `/actions` | ✅ | started_at, finished_at |

### People / Tags / Emotions
| Endpoint | Описание |
|----------|----------|
| CRUD `/people` | Профили людей, most-mentioned |
| CRUD `/tags` | Теги, find-or-create, most-used |
| PUT `/emotions/node/:nodeId` | Заменить эмоции узла |
| GET `/emotions/stats` | Статистика эмоций пользователя |
| GET `/emotions/timeline` | Таймлайн эмоций |

### Аналитика (вычисляется поверх графа)
| Endpoint | Описание |
|----------|----------|
| GET `/analytics/profile` | Профиль пользователя |
| GET `/analytics/emotion-timeline` | Паттерны поведения |
| GET `/analytics/activity-heatmap` | Топология активности |
| GET `/analytics/streaks` | Current streak |
| GET `/analytics/node-connections` | Топология связей |

### AI (интерпретации поверх графа)
| Endpoint | Описание |
|----------|----------|
| POST `/ai/analysis/:nodeId` | Запросить анализ |
| GET `/ai/analysis/:nodeId` | Результаты анализа |
| POST `/ai/image/:nodeId` | Генерация изображения |
| GET `/ai/image/:nodeId` | Сгенерированные изображения |

### Метрики (привязаны к узлам)
| Endpoint | Описание |
|----------|----------|
| POST `/measurements/node/:nodeId` | Добавить метрику |
| GET `/measurements/node/:nodeId` | Метрики узла |
| DELETE `/measurements/node/:nodeId` | Удалить метрики |

### Auth
| Endpoint | Описание |
|----------|----------|
| POST `/auth/register` | Регистрация (+ капча) |
| POST `/auth/login` | Логин (+ капча) |
| POST `/auth/recover` | Восстановление |
| GET `/auth/verify` | Проверка токена |

---

## Тестирование

```
Test Suites: 13 passed, 13 total
Tests:       354 passed, 354 total
```

```bash
npm run test:unit          # Unit (0.6s)
npm run test:integration   # Integration с PostgreSQL + Redis
npm run test:e2e           # E2E через supertest
npm run ci                 # lint + typecheck + unit
```

### CI/CD (GitHub Actions)

```
lint-and-types  → 30s
unit-tests      → 1m
migrate-test    → 2m
integration     → 3m
deploy (main)   → 1m
```

---

## Структура проекта

```
src/
├── modules/           # 12 модулей (graph, dreams, thoughts, ...)
├── security/          # Sanitizer system (53 attack patterns)
├── redis/             # Redis layer (JWT blacklist, rate limiting, cache)
├── routes/            # Express routes → /api/v1/*
├── shared/            # BaseRepository, errors, middleware
├── db/                # Pool, migration scripts
└── __tests__/         # Test setup, helpers, factories
```

## История сессий

### Модульная архитектура (9 July 2026)

**БЫЛО:** Единая таблица `entries`, отдельные `people`, `body-states`, `circumstances`

**СТАЛО:**
- `nodes` — все типы в одном (15 node types, справочник)
- `edges` — связи между любыми узлами (16 edge types, справочник)
- эмоции, теги, метрики привязаны к любым узлам
- `deleted_at` — soft delete with triggers

### Security — Sanitizer System

Полная защита по модели HackTricks/OWASP:
- 53 attack patterns (SQL, XSS, command injection, ...)
- Chain of Responsibility pipeline
- Presets: userInput, api, search, auth
- Express middleware — глобальная защита

### Redis Layer

- JWT blacklist (revocable tokens)
- Rate limiting across instances
- Reference data cache (24h TTL)

### Testing & CI/CD

- 3 Jest configs: unit (14 security tests), integration (354 total), e2e
- ESLint + TypeScript typecheck
- docker-compose.test.yml (PostGIS + Redis)