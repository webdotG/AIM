# Architecture

## Overview

AIM is a **graph-based life journal** that creates psychological profiles through analysis of dreams, memories, thoughts, plans, and actions. All data is stored as a graph in PostgreSQL.

## System architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│   Frontend  │         │    Backend   │         │  Database  │
│  React 18   │◄───────►│  Express TS  │◄───────►│  Postgres  │
│  MobX       │  HTTPS  │  JWT Auth    │  SQL    │  + PostGIS │
│  Vite       │◄───────►│  Sanitzation │         │            │
└─────────────┘  Redis  │  Rate Limit  │         └────────────┘
                        └──────────────┘
```

## Key concepts

### Graph model
- **16 node types**: dream, thought, memory, plan, action, person, place, book, project, conversation, movie, course, website, music, article
- **16 edge types**: mentions, caused, resulted_in, inspired, reminded_of, about, contains, performed_with, completed_by, created, references, symbolizes, contradicts, depends_on, belongs_to, related_to
- **Universal linking**: Any node can connect to any other node via edges
- **Soft delete**: All entities use `deleted_at` column

### Request flow
```
HTTP Request
    ↓
Helmet + CORS + JSON parser
    ↓
Rate limiter (100 req/15min general, 5 login/15min)
    ↓
Sanitization (XSS, SQLi, Command, Path, CRLF)
    ↓
Express router
    ↓
Auth middleware (JWT + Redis blacklist) ← except public endpoints
    ↓
Controller → Service → Repository → PostgreSQL
    ↓
Response: { success, data }
```

### Multi-platform
| Layer | Web | Telegram Mini App |
|-------|-----|-------------------|
| Routing | React Router DOM | Custom nav stack provider |
| Layout | MainLayout + Header + Nav | TelegramLayout + TG buttons |
| Navigation | Browser back/forward | Telegram back button |
| Theme | 4 CSS themes + neon animations | Uses TG theme colors |
| Haptics | None | TG WebApp haptic feedback |

### i18n
| File | Language | Files in file |
|------|----------|---------------|
| `layers/language/translations/ru.js` | Русский | ~636 lines |
| `layers/language/translations/en.js` | English | ~636 lines |
| `layers/language/translations/fr.js` | French | ~636 lines |

### State management
| Frontend | Backend |
|----------|---------|
| **MobX** | **Discussions: store count** |
| 11 sub-stores | Redis cache |
| @observable, @action | JWT blacklist |
| useStore hooks | Rate limiting |
| React re-render on change | Reference data (24h TTL) |

## Technology summary

| Component | Backend | Frontend |
|-----------|---------|----------|
| Language | TypeScript 5.3 | JavaScript (JSX) |
| Framework | Express 4.18 | React 18.3 |
| Database | PostgreSQL 16 + PostGIS | — |
| Cache | Redis (ioredis) | — |
| ORM | Raw SQL + pg | — |
| Validation | Zod 4.0 + Yup | Yup |
| Auth | JWT + bcrypt + pepper | hCaptcha |
| State | — | MobX + React Query |
| Routing | Express router | React Router DOM |
| 3D | — | Three.js + React Three Fiber |
| Sanitization | Custom pipeline | Custom pipeline + DOMPurify |
| Logging | Winston | Console |
| Testing | Jest + Supertest | Jest + Testing Library |
| API Docs | OpenAPI 3.1 + Swagger | Storybook |