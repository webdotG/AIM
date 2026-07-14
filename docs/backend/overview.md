# Backend Overview

## Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript 5.3 |
| Framework | Express 4.18 |
| Database | PostgreSQL 16 + PostGIS |
| Cache | Redis (ioredis) |
| ORM | Raw SQL + pg |
| Validation | Zod 4.0 |
| Auth | JWT + bcrypt + pepper |
| Security | Sanitization pipeline + Helmet + CORS + Rate Limiting |
| Logging | Winston |
| Testing | Jest + Supertest |
| API Docs | OpenAPI 3.1 + Swagger UI |

## Signal structure

Each domain module follows the **Controller → Service → Repository** pattern:

```
Module/
├── controllers/        # HTTP request → response
│   └── XXController.ts  # Singleton, error handling
├── services/            # Business logic, transactions
│   └── XXService.ts      # Orchestrates multiple repos
├── repositories/        # Raw SQL queries
│   └── XXRepository.ts   # Extends BaseRepository
├── schemas/           # Zod schemas (optional)
├── validation/        # Zod schemas (optional)
└── __tests__/          # Integration tests
```

## Shared infrastructure

```
src/
├── db/                    # PostgreSQL pool + query helpers
├── security/              # Sanitization, XSS, SQLi, injection protection
├── shared/                # Errors, middleware, types, utils, logger
├── routes/                 # API routing v1
└── redis/                  # JWT blacklist, reference cache, rate limiter
```

## Error types

| Error | Status | Description |
|-------|--------|-------------|
| `ValidationError` | 400 | Invalid input, format |
| `UnauthorizedError` | 401 | Missing/expired token |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate resource |
| `Pg internal error` | 500 | Internal server error |

## Database triggers

1. **Hard delete prevention** — all nodes must use `UPDATE deleted_at = NOW()`
2. **Node type consistency** — node must have corresponding child table record
3. **Measurement type check** — value type must match definition

## More details

For detailed overview, see `README.md`.