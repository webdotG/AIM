# AIM — Life Graph

**AIM** — приложение для построения психологического профиля через графовый анализ снов, воспоминаний, мыслей, планов и действий.

> 🚀 Быстрый старт → [Getting Started](getting-started.md)
> 📖 Карта бэкенда → [Backend](backend/README.md)
> 🎨 Карта фронтенда → [Frontend](frontend/README.md)
> 🔌 API → [Swagger](api-reference.md)

---

## Архитектура

```
┌─────────────┐         ┌──────────────┐
│   Frontend  │         │   Backend    │
│  React 18   │◄───────►│  Express TS  │
│  MobX       │  HTTPS  │  PostgreSQL  │
│  Vite       │◄───────►│  Redis       │
└─────────────┘         └──────────────┘
```

| Sled | Spec |
|------|------|
| Backend | Node.js + TypeScript + Express |
| Frontend | React 18 + Vite + MobX + React Router |
| Database | PostgreSQL 16 + PostGIS |
| Cache | Redis (JWT blacklist, reference cache, rate limiting) |
| Auth | JWT + bcrypt + HMAC-SHA256 pepper + hCaptcha |
| Security | Sanitization pipeline (XSS, SQLi, Command Injection, Path Traversal, CRLF) |

---

## Обзор проекта

- **Backend:** 87 API-операций, 56 путей, 15 Open-24 таблиц, 23 таблицы
- **Frontend:** 192 JS/JSX-файлов, 11 MobX-хранилища, 25+ компонентов, 4 темы
- **БД:** 23 таблицы, 3 триггера, 16 типов узлов, 16 типов рёбер
- i18n: 3 языка (ru, en, fr), по 636 строк переводов каждый