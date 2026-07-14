# AIM Backend — Карта Проекта

> **Life Graph** — психологический профиль через графовый анализ снов, воспоминаний, мыслей, планов и действий.

## Быстрый Старт

```
Стек: Node.js + TypeScript + Express + PostgreSQL + Redis

Запуск:
  npm install
  npm run dev          # PORT=3003
  npm run build        # compile TS → JS
  npm run start        # production
  npm run test         # unit + integration
  npm run lint         # ESLint
  npm run typecheck    # TSC check

Переменные окружения (обязательные):
  DB_USER, DB_PASSWORD  — PostgreSQL
  JWT_SECRET            — JWT signing key
  PASSWORD_PEPPER       — минимум 32 символа, для HMAC-SHA256
  REDIS_URL             — Redis (опционально, graceful degradation)
```

```
API: http://localhost:3003/api/v1
Health: GET /health
```

---

## Архитектура (одной страницей)

```
HTTP Request
    ↓
Helmet + CORS + JSON parser
    ↓
Request Logger → Winston logs
    ↓
Rate Limiter (100 req/15min general, 5 login/15min)
    ↓
Security Pipeline (XSS, SQLi, Command Injection, Path Traversal, CRLF sanitization)
    ↓
Routes (/api/v1/*)
    ↓
Auth Middleware (JWT verify + Redis blacklist check) ← except public endpoints
    ↓
Controller → Service → Repository → PostgreSQL
    ↓
Response
```

### Модульная структура

Каждый доменный модуль следует паттерну **Controller → Service → Repository**:
- **Controller** — принимает HTTP запрос, вызывает сервис, возвращает ответ
- **Service** — бизнес-логика, транзакции (BEGIN/COMMIT/ROLLBACK), валидация
- **Repository** — SQL-запросы к PostgreSQL

```
src/
├── index.ts                    # Entry point
├── db/                         # PostgreSQL pool + query helpers
├── redis/                      # Redis pool, JWT blacklist, reference cache
├── config/                     # JWT config
├── shared/                     # Shared: errors, middleware, types, utils
├── security/                   # Sanitization pipeline, patterns, logger
├── services/                   # Cross-cutting: JWTBlacklist, RedisRateLimiter
├── routes/                     # Express routing
│   └── v1/                     # All API v1 routes
└── modules/                    # Domain modules
    ├── auth/                   # Registration, login, password, JWT
    ├── graph/                  # Nodes, edges, traversal, types
    ├── dreams/                 # Dream journal entries
    ├── thoughts/               # Thought entries
    ├── memories/               # Memory entries
    ├── plans/                  # Plan/task entries
    ├── actions/                # Action/activity tracking
    ├── people/                 # Contact/people management
    ├── emotions/               # Berkeley emotion model (26 emotions)
    ├── tags/                   # User-defined tagging system
    ├── measurements/           # Quantitative measurements on nodes
    ├── ai/                     # AI analysis + image generation
    └── analytics/              # Statistics and analytics
```

---

## Граф данных — ключевая концепция

Все сущности в системе — это **узлы (nodes)** графа. Любые два узла можно связать **ребром (edge)**.

**16 типов узлов:** dream, thought, memory, plan, action, person, place, book, project, conversation, movie, course, website, music, article

**16 типов рёбер:** mentions, caused, resulted_in, inspired, reminded_of, about, contains, performed_with, completed_by, created, references, symbolizes, contradicts, depends_on, belongs_to, related_to

Каждый узел хранится в общей таблице `nodes` + в специализированной таблице своего типа. Каждое ребро хранится в `edges` с указанием типа, веса и уверенности.

---

## Таблицы PostgreSQL (23 таблицы)

### Core граф
| Таблица | Назначение |
|---------|-----------|
| `users` | Пользователи (id, login, password_hash, backup_code_hash) |
| `nodes` | Узлы графа (UUID, user_id, node_type_id, title, timestamps) |
| `edges` | Рёбра графа (from/to node UUID, edge_type, confidence, weight) |
| `node_types` | Справочник типов узлов (16 типов) |
| `edge_types` | Справочник типов рёбер (16 типов) |

### Доменные сущности
| Таблица | Узловой тип | Специальные поля |
|---------|------------|-----------------|
| `dreams` | dream | content, dream_date, lucidity, vividness, nightmare, sleep_start/end |
| `thoughts` | thought | content, importance, confidence |
| `memories` | memory | content, event_date, confidence |
| `plans` | plan | description, deadline, priority, completed, completed_at |
| `actions` | action | activity_id, started_at, finished_at, description |
| `people` | person | full_name, nickname, birth_date, relationship, notes |
| `places` | place | title, address, location (PostGIS POINT) |
| `projects` | project | description, started/finished_at, status |
| `books` | book | title, author, isbn, pages |

### Метаданные
| Таблица | Назначение |
|---------|-----------|
| `emotions` | 26 эмоций Беркли (positive/negative/neutral) |
| `node_emotions` | Связь узел→эмоция с интенсивностью (1-10) |
| `tags` | Юзерские теги (user_id, name) |
| `node_tags` | Связь узел→тэг (many-to-many) |
| `activities` | Справочник активностей (иерархический, parent_id) |
| `measurement_definitions` | Определения измерений (integer/decimal/boolean/text) |
| `activity_measurements` | Связь активность→измерения |
| `node_measurements` | Значения измерений для узлов (sparse: one value column) |
| `characteristics` | Характеристики (справочник) |
| `characteristic_rules` | Правила вычисления характеристик из активностей |

### AI и аналитика
| Таблица | Назначение |
|---------|-----------|
| `ai_analysis` | Результаты AI-анализа (ON DELETE RESTRICT) |
| `ai_images` | AI-сгенерированные изображения (ON DELETE RESTRICT) |

---

## Архитектурные принципы

1. **Факты неизменяемы** — INSERT основной, UPDATE ограниченный, DELETE запрещён
2. **Граф универсален** — любая сущность связана с любой другой
3. **Интерпретации вычисляемы** — AI/аналитика сохранены как факты генерации
4. **БД гарантирует целостность** — триггеры и CHECK constraints
5. **Удаление — новый факт** — только soft delete через `deleted_at`

---

## Безопасность

- **Пароли:** HMAC-SHA256 pepper → bcrypt (12 salt rounds), min 12 chars, uppercase+lowercase+digit required, pattern checking, entropy estimation
- **Backup-код:** 32 hex символа, хранится как bcrypt hash, единственный способ восстановления пароля
- **JWT:** configurable expiration (default 24h), Redis-based blacklist для ревокации
- **hCaptcha:** на register/login/recover
- **Rate limiting:** 100 req/15min общий, 5 login attempts/15min
- **Sanitization pipeline:** XSS, SQLi, command injection, path traversal, CRLF — автоматическая очистка всех входящих запросов
- **Timing attack protection:** константная задержка 500ms при логине
- **PostgreSQL triggers:** запрет hard delete узлов, Consistency check node_type↔child table, Measurement type check

---

## Кэш (Redis)

- **JWT Blacklist:** ревокация токенов (`jwt:blacklist:{jti}`, TTL = token expiry + 60s)
- **Reference Cache:** кэширование справочных данных — node_types, edge_types, emotions, measurement_definitions (`ref:{type}:{code}`, TTL 24h)
- **Rate Limiter:** слайдинг-окно счётчики (`ratelimit:{scope}:{userId}:{endpoint}`)
- Graceful degradation: сервис продолжает работу без Redis после 3 неудачных попыток подключения

---

## ДETAILED MODULE documentation

| # | Документ | Что описывает |
|---|----------|--------------|
| 00 | [00-infrastructure.md](./00-infrastructure.md) | Entry point, DB pool, Redis, config, shared utils, middleware, types, logger |
| 01 | [01-security.md](./01-security.md) | Sanitization pipeline, XSS/SQLi/command/path/cRLF protection, presets, patterns |
| 02 | [02-auth.md](./02-auth.md) | Registration, login, JWT, password hashing (bcrypt+pepper), backup codes, hCaptcha |
| 03 | [03-graph-core.md](./03-graph-core.md) | Nodes, edges, types, BFS traversal, graph data, most connected |
| 04 | [04-domain-entities.md](./04-domain-entities.md) | Dreams, Thoughts, Memories, Plans, Actions, People — CRUD паттерн + детали |
| 05 | [05-emotions.md](./05-emotions.md) | Berkeley 26-emotion model, node-emotion mapping, intensity, stats |
| 06 | [06-tags.md](./06-tags.md) | User tags, node-tag many-to-many, findOrCreate, most-used/unused |
| 07 | [07-measurements.md](./07-measurements.md) | Sparse value columns, activity measurements, characteristics |
| 08 | [08-ai.md](./08-ai.md) | AI analysis + image generation, external API, RESTRICT deletion |
| 09 | [09-analytics.md](./09-analytics.md) | Statistics, streaks, heatmaps, emotion timeline, user profile |
| 10 | [10-routes.md](./10-routes.md) | Full API route table, auth matrix, middleware chain |

---

## Тестирование

```
npm run test           # unit + integration
npm run test:unit      # unit only
npm run test:integration # integration only
npm run test:coverage  # с coverage
npm run test:watch     # watch mode
```

- Jest + Supertest
- Интеграционные тесты на реальную PostgreSQL базу (`dream_journal_test`)
- Транзакционные тесты: BEGIN → тест → ROLLBACK
-覆盖: Auth, Graph, Dreams, Thoughts, Memories, Plans, Actions, People, Emotions, Tags, Measurements, AI, Analytics

---

## Миграции

- `db/migrations/001_init.sql` — полная схема БД (658 строк)
  - Extensions: PostGIS, pgcrypto
  - All tables, indexes, triggers, default data
  - Run: `npm run migrate`

---

## PostGIS

Расширение PostGIS включено для таблицы `places` (географические точки).

---

*Документация сгенерирована реверс-инжинирингом кодовой базы. Последнее обновление: July 2026.*