# Module 10: Routes

## Overview

The routing layer defines the Express routing structure for the entire API. All routes are prefixed with `/api/v1`. Routing is organized hierarchically: `routes/index.ts` mounts the v1 router, which in turn mounts individual module routers.

**Location:** `src/routes/`

---

## Routing Hierarchy

```
src/index.ts
  ↓ app.use(routes)
src/routes/index.ts
  ↓ router.use('/api/v1', v1Routes)
src/routes/v1/index.ts
  ↓ router.use('/auth', authRoutes)
  ↓ router.use('/graph', graphRoutes)
  ↓ router.use('/dreams', dreamsRoutes)
  ↓ ... (13 module routers total)
```

### `src/routes/index.ts`
Creates a Router and mounts `v1Routes` at `/api/v1`. This is the single routing entry point imported by `src/index.ts`.

### `src/routes/v1/index.ts`
Creates a Router and mounts all 13 module routers. Import order:
1. `authRoutes` → `/auth`
2. `graphRoutes` → `/graph`
3. `dreamsRoutes` → `/dreams`
4. `thoughtsRoutes` → `/thoughts`
5. `memoriesRoutes` → `/memories`
6. `plansRoutes` → `/plans`
7. `actionsRoutes` → `/actions`
8. `peopleRoutes` → `/people`
9. `emotionsRoutes` → `/emotions`
10. `tagsRoutes` → `/tags`
11. `analyticsRoutes` → `/analytics`
12. `measurementsRoutes` → `/measurements`
13. `aiRoutes` → `/ai`

---

## Complete Route Table

| Full Path | Auth | hCaptcha | Controller |
|-----------|------|----------|------------|
| `/auth/register` | No | Yes | AuthController |
| `/auth/login` | No | Yes | AuthController |
| `/auth/recover` | No | Yes | AuthController |
| `/auth/verify` | No | No | AuthController |
| `/auth/check-password-strength` | No | No | AuthController |
| `/auth/generate-password` | No | No | AuthController |
| `/graph/node-types` | No | No | GraphController |
| `/graph/edge-types` | No | No | GraphController |
| `/graph/*` | Yes | No | GraphController |
| `/dreams/*` | Yes | No | DreamsController |
| `/thoughts/*` | Yes | No | ThoughtsController |
| `/memories/*` | Yes | No | MemoriesController |
| `/plans/*` | Yes | No | PlansController |
| `/actions/*` | Yes | No | ActionsController |
| `/people/*` | Yes | No | PeopleController |
| `/emotions/` | No | No | EmotionsController |
| `/emotions/category/:category` | No | No | EmotionsController |
| `/emotions/*` | Yes | No | EmotionsController |
| `/tags/*` | Yes | No | TagsController |
| `/measurements/*` | Yes | No | MeasurementsController |
| `/ai/*` | Yes | No | AIController |
| `/analytics/*` | Yes | No | AnalyticsController |

### Partial auth routes
- **Emotions:** `GET /` and `GET /category/:category` are public. `router.use(authenticate)` is placed after these two routes, so all subsequent emotion routes require auth.
- **Graph:** `GET /node-types` and `GET /edge-types` are public reference data. All other graph routes require auth.
- **Auth:** `register`, `login`, `recover` require hCaptcha but not JWT. Other auth endpoints (`verify`, `check-password-strength`, `generate-password`) require neither.

---

## Middleware Chain

### Application-level (in `src/index.ts`)
```
Helmet → CORS → JSON parser → Request Logger → Rate Limiter
     → Sanitization Pipeline → Routes → 404 handler → Error Handler
```

Per-request flow:
1. `helmet()` — HTTP security headers
2. `cors()` — Cross-origin resource sharing
3. `express.json()` — JSON body parsing
4. `requestLogger` — Logs method, path, status, duration
5. `generalLimiter` — 100 requests per 15 min per user/IP
6. `createSanitizerMiddleware({ preset: 'api' })` — Input sanitization (skipped for `/health`, `/favicon.ico`)
7. Module router with optional `authenticate` / `hcaptchaMiddleware.verify`
8. `errorHandler` — Catches AppError, ZodError, JWT errors, UUID errors, PG errors

### Route-level middleware
Two middleware functions are applied at the route level:

| Middleware | File | Applied Where |
|-----------|------|--------------|
| `authenticate` | `shared/middleware/auth.middleware.ts` | Before protected routes in each module router |
| `validate(schema)` | `shared/middleware/validator.middleware.ts` | On specific routes (e.g., graph CRUD) |

---

## Auth Middleware (`authenticate`)

**File:** `src/shared/middleware/auth.middleware.ts`

**Process:**
1. Check `Authorization` header for `Bearer <token>` prefix
2. Verify JWT signature using `JWT_SECRET`
3. Extract `userId` from decoded payload (checks `decoded.userId`, `decoded.user_id`, `decoded.id`)
4. Look up token's `jti` in `JWTBlacklistService` (Redis) — reject if blacklisted
5. Set `req.userId = userId` on the Express request object
6. Call `next()`

**Error responses:**
- No token: 401 "No token provided"
- No userId in token: 401 "Token does not contain user ID"
- Token blacklisted: 401 "Token has been revoked"
- Token expired: 401 "Token expired"
- Invalid token: 401 "Invalid token"

**TypeScript extension:** Declares global `Express.Request` with `userId?: number` and `userLogin?: string`.

---

## Path Protection Chain

```
HTTP Request
    → Helmet
    → CORS
    → JSON Parse
    → Request Logger
    → Rate Limiter (general: 100/15min)
    → Sanitization Pipeline (body, query, params, headers)
    → Route Match
        → hCaptcha (auth endpoints only)
        → authenticate (most routes)
        → validate(schema) (selective)
    → Controller → Service → Repository → DB
    → Response or errorHandler
```

---

## Health Check

**Path:** `GET /health`
**Auth:** None
**Handler:** Inline in `src/index.ts` (not a route file)

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "1.0.0"
}
```

Note: The health check handler is defined **after** `app.use(routes)` in `src/index.ts`, meaning it only catches requests that don't match any v1 route. It is also excluded from sanitization via `skipPaths: ['/health', '/favicon.ico']`.

---

## Route Ordering Rules

Within individual route files, ordering matters to prevent Express Router from matching more specific paths as generic parameters:

1. **Static paths before parameterized:** `/most-used` before `/:id` (tags), `/profile` before `/stats` (analytics)
2. **Auth middleware placement:** In `emotions.routes.ts` and `graph.routes.ts`, public routes are defined **before** `router.use(authenticate)`, so auth applies only to subsequent routes.
3. **Validation middleware:** The `validate(schema)` middleware is applied only to routes that need request validation (primarily graph CRUD), placed between route definition and controller handler.

---

## Design Notes

1. **Single entry point:** `src/routes/index.ts` is the one import in `src/index.ts` — adding a new module requires adding it in two places (v1/index.ts import + router.use).

2. **Module self-containment:** Each module router file imports its own controller and applies its own middleware. No cross-module dependencies in route files.

3. **Versioned API:** The `/api/v1` prefix allows future versioning without changing the endpoint structure.

4. **404 handler:** An inline 404 handler returns `{ success: false, error: 'Endpoint not found' }` for unmatched routes.

5. **Server port:** Default 3003, configurable via `PORT` env var. Test environment skips `app.listen()`.