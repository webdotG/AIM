# Getting Started

## Требования

- **Node.js** 20+
- **PostgreSQL** 16+ (с расширениями PostGIS, pgcrypto)
- **Redis** (опционально, graceful degradation)
- **PostgreSQL migration** command

## Быстрый старт

```bash
# 1. Клонируем репозиторий
git clone <repo-url>
cd AIM

# 2. Устанавливаем зависимости
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Настраиваем окружение
cp backend/.env.example backend/.env  # создаём .env
# Редактируем: DB_USER, DB_PASSWORD, JWT_SECRET, PASSWORD_PEPPER

# 4. Запускаем бэкенд
cd backend
npm run dev        # http://localhost:3003

# 5. Запускаем фронтенд
cd frontend
npm run dev          # http://localhost:5173
```

## Переменные окружения

### Backend (`.env`)

| Variable | Required | Example |
|----------|----------|---------|
| `DB_USER` | ✅ | `postgres` |
| `DB_PASSWORD` | ✅ | `secret` |
| `DB_HOST` | ❌ | `localhost` |
| `DB_PORT` | ❌ | `5432` |
| `DB_NAME` | ❌ | `dream_journal` |
| `JWT_SECRET` | ✅ | `random-64-chars-hex` |
| `PASSWORD_PEPPER` | ✅ | `32+ characters` |
| `REDIS_URL` | ❌ | `redis://localhost:6379` |
| `HCAPTCHA_SECRET_KEY` | ❌ | `xxx` |
| `HCAPTCHA_ENABLED` | ❌ | `true` |

### Frontend (`.env`)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | ❌ | `http://localhost:3003/api/v1` |

## Структура проекта

```
AIM/
├── backend/              # Express + TypeScript + PostgreSQL
│   ├── src/
│   │   ├── index.ts          # Entry point + Swagger UI
│   │   ├── db/                # Connection pools + query helpers
│   │   ├── security/          # Security middleware sanitization
│   │   ├── shared/            # Shared: errors, middleware, types, utils
│   │   ├── modules/            # Domain modules (auth, graph, dreams, etc.)
│   │   ├── routes/              # Express routing
│   │   ├── redis/               # Redis: pool, blacklist, cache
│   │   └── services/            # JWT blacklist, rate limiter, email
│   └── backend_docs/          # Backend documentation
├── frontend/              # React + Vite + MobX
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Root component + Providers
│   │   ├── layers/               # Platform, Language, Theme, Security contexts
│   │   ├── store/               # MobX state management (11 sub-stores)
│   │   ├── core/                # Entities, API, clients, mappers, repos
│   │   ├── security/            # Sanitizers, pipelines, validators
│   │   ├── platforms/           # Web/Telegram routing
│   │   └── ui/                  # React components, pages, layouts
│   └── frontend_docs/            # Frontend documentation
└── docs/                     # GitBook documentation (this folder)
```

## Полезные команды

### Backend

```bash
npm run dev           # nodemon dev server (port 3003)
npm run build         # typescript → JS
npm run start         # production mode
npm run test          # unit + integration
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run swagger-serve  # validate spec
```

### Frontend

```bash
npm run dev           # Vite dev server (port 5173)
npm run build         # production build
npm run test          # Jest
npm run lint          # ESLint
npm run format        # Prettier
npm run storybook     # Storybook (port 6006)
```

## Следующие шаги

- 🏗️ [Архитектура](../architecture/overview.md)
- 🔧 [Бэкенд](../backend/README.md)
- 🎨 [Фронтенд](../frontend/README.md)
- 🗄️ [Базы данных](../database/README.md)
- 🔌 [API Reference](../api-reference.md)