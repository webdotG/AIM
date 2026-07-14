# Module 0: Infrastructure

## Overview

The Infrastructure layer provides the Foundation of the backend application — Express server setup, database connectivity, Redis caching, configuration management, shared utilities, and common types.

**Tech Stack:** Node.js + TypeScript + Express + PostgreSQL + Redis + Winston

---

## Entry Point (`src/index.ts`)

The application entry point bootstraps an Express server with the following middleware chain:

```
Request → Helmet → CORS → JSON parser → Request Logger → Rate Limiter
       → Sanitization Pipeline → Routes → 404 handler → Error Handler
```

**Key details:**
- Default port: `3003` (via `process.env.PORT`)
- Health check: `GET /health`
- Environment-aware loading of `.env` / `.env.test`

---

## Database Layer

### Connection Pool (`src/db/pool.ts`)
- Uses `pg` library with a connection pool
- Pool size: 20 connections (production), 10 (test)
- Idle timeout: 30s, connection timeout: 5s
- SSL enabled only in production
- Environment-specific database name selection (`dream_journal` / `dream_journal_test`)

### Query Helpers (`src/db/query.ts`)
Three utility functions wrapping the pool:
- `query<T>(sql, params)` — returns array of rows
- `queryOne<T>(sql, params)` — returns first row or null
- `execute(sql, params)` — executes without returning data

---

## Redis Layer

### Connection (`src/redis/pool.ts`)
- Uses `ioredis` with lazy connect and retry strategy
- Default URL: `redis://localhost:6379`
- Max 3 retries with exponential backoff (up to 2s)
- Graceful degradation: service continues without Redis after 3 failures
- Key functions: `getRedis()`, `closeRedis()`, `isRedisConnected()`

### JWT Blacklist (`src/services/JWTBlacklistService.ts`)
- Stores revoked JWT tokens in Redis with key pattern `jwt:blacklist:{jti}`
- TTL: token expiration + 60 seconds
- Methods: `blacklistToken()`, `isBlacklisted()`, `removeToken()`

### Reference Cache (`src/redis/referenceCache.ts`)
- Caches reference data (node_types, edge_types, emotions, measurement_definitions) in Redis
- Key patterns: `ref:node_type:{code}`, `ref:edge_type:{code}`, `ref:emotion:{code}`, `ref:measurement:{code}`
- TTL: 86400s (24 hours)
- Functions: `cacheReferenceData()`, `getReferenceCache()`, `invalidateReferenceCache()`, getter helpers

### Redis Rate Limiter (`src/services/RedisRateLimiter.ts`)
- Sliding window rate limiter using Redis INCR/EXPIRE
- Pre-configured limiters: `auth` (5/min), `api` (100/15min), `search` (30/min), `ai` (10/min)
- Methods: `check(userId, endpoint)`, `reset(userId, endpoint)`

---

## Configuration

### Shared Config (`src/shared/config/index.ts`)
Central configuration object with sections: `database`, `jwt`, `password`, `server`, `logging`.

### JWT Config (`src/config/jwt.ts`)
Exports `JWT_SECRET` and `JWT_EXPIRES_IN` from environment variables.

### Password Policy (from shared config)
- Pepper: from `PASSWORD_PEPPER` env var
- Salt rounds: 12
- Min length: 12
- Requires: special chars, numbers, mixed case

---

## Shared Utilities

### Error Classes (`src/shared/errors/AppError.ts`)
Hierarchical error classes:
- `AppError` — base class with `statusCode` and `isOperational`
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `NotFoundError` (404)
- `ConflictError` (409)

### Logger (`src/shared/utils/logger.ts`)
- Winston-based logger
- Console (colored, simple format) + `logs/error.log` + `logs/combined.log`
- Disabled in test environment
- Configurable level via `LOG_LEVEL`

### Base Repository (`src/shared/repositories/BaseRepository.ts`)
Abstract class providing pool access and query method for all module repositories.

---

## Shared Middleware

### Error Handler (`src/shared/middleware/errorHandler.ts`)
Catches: AppError, ZodError, JWT errors, UUID errors, PostgreSQL errors (23505, 23503, etc.).

### Rate Limiter (`src/shared/middleware/rateLimiter.middleware.ts`)
- `generalLimiter` — 100 requests per 15 min per user/IP
- `authLimiter` — 5 login attempts per 15 min per login/IP

### Request Logger (`src/shared/middleware/requestLogger.ts`)
Logs method, path, status, duration, user-agent on response finish. Skipped in tests.

### Auth Middleware (two versions)
- `src/shared/middleware/auth.middleware.ts` — full version with JWT blacklist check (extends Express.Request with `userId`, `userLogin`)
- `src/shared/middleware/auth.ts` — simplified version using `jwtService.verify()`

### hCaptcha Middleware (`src/shared/middleware/hcaptcha.middleware.ts`)
- Verifies `hcaptchaToken` from request body via `hcaptcha.com/siteverify`
- Fail-open mode configurable via `HCAPTCHA_FAIL_OPEN`
- Singleton: `hcaptchaMiddleware`

### Validator Middleware (`src/shared/middleware/validator.middleware.ts`)
Zod-based validation: `validate(schema)` parses body, query, params against a ZodType.

---

## Shared Types

### `src/shared/types/graph.types.ts`
- `NodeTypeCode` enum: 16 node types (dream, thought, memory, plan, action, person, place, book, project, conversation, movie, course, website, music, article)
- `EdgeTypeCode` enum: 16 edge types (mentions, caused, resulted_in, inspired, reminded_of, about, contains, performed_with, completed_by, created, references, symbolizes, contradicts, depends_on, belongs_to, related_to)
- Interfaces: `Node`, `Edge`, `NodeType`, `EdgeType`, `CreateNodeInput`, `CreateEdgeInput`, `UpdateNodeInput`

### `src/shared/types/domain.types.ts`
- `EmotionCategory` enum: positive, negative, neutral
- `MeasurementDataType` enum: integer, decimal, boolean, text
- Interfaces: `Emotion`, `NodeEmotion`, `AssignNodeEmotionInput`, `MeasurementDefinition`, `NodeMeasurement`, `CreateNodeMeasurementInput`

### `src/shared/types/common.types.ts`
- `PaginationParams`, `PaginationResult<T>`
- `Tag`, `NodeTag`, `ActivityInput`, `AIAnalysisResult`
- Utility constants: `VALID_NODE_TYPES`, `VALID_EDGE_TYPES`, etc.

---

## Architecture Principles (from DB migration)

1. **Facts are immutable** — INSERT is primary, UPDATE is restricted, DELETE is forbidden
2. **Graph is universal** — any entity can be linked to any other
3. **Interpretations are computed** — AI/analytics are derived but stored as generation facts
4. **DB guarantees integrity** — triggers and CHECKs, not just application validation
5. **Removal is a new fact** — soft delete via `deleted_at` only