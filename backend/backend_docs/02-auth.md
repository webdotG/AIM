# Auth Module

Authentication and authorization module for the AIM backend. Handles user registration, login, password recovery, token management, and password security.

## Table of Contents

- [Architecture](#architecture)
- [File Structure](#file-structure)
- [API Routes](#api-routes)
- [Authentication Flows](#authentication-flows)
- [Security](#security)
- [Validation Schemas](#validation-schemas)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Architecture

The Auth module follows a layered architecture:

```
Client Request
    │
    ▼
┌──────────────────────────────────┐
│  hCaptcha Middleware (middleware) │  ← Bot protection for register/login/recover
├──────────────────────────────────┤
│  AuthController (controller)     │  ← Request parsing, Zod validation, response formatting
├──────────────────────────────────┤
│  AuthService (service)           │  ← Business logic: register, login, password update, token validation
├──────────────────────────────────┤
│  JWTService (service)            │  ← JWT sign/verify
│  PasswordHasher (service)        │  ← bcrypt + HMAC-SHA256 pepper hashing, strength check, backup codes
├──────────────────────────────────┤
│  UserRepository (repository)     │  ← PostgreSQL queries for users table
├──────────────────────────────────┤
│  PostgreSQL (database)           │
└──────────────────────────────────┘
```

**Singleton pattern:** `authController`, `jwtService`, and `passwordHasher` are exported as singleton instances.

---

## File Structure

| File | Role |
|------|------|
| `src/modules/auth/controllers/AuthController.ts` | Express controller — singleton `authController`. Parses requests, validates input with Zod, delegates to services, formats JSON responses. |
| `src/modules/auth/services/AuthService.ts` | Core auth business logic — registration, login, password update/recovery, token validation. Injected with `UserRepository`. |
| `src/modules/auth/services/JWTService.ts` | JWT signing and verification — singleton `jwtService`. Configurable secret and expiration. |
| `src/modules/auth/services/PasswordHasher.ts` | Password hashing (bcrypt + HMAC-SHA256 pepper), strength checking, backup code generation — singleton `passwordHasher`. |
| `src/modules/auth/repositories/UserRepository.ts` | Data access layer — PostgreSQL queries for the `users` table. Uses parameterized queries. |
| `src/modules/auth/validation/auth.schema.ts` | Zod validation schemas used by `AuthController`. Flat structure matching controller `req.body`. |
| `src/modules/auth/schemas/auth.schema.ts` | Alternative Zod schemas with nested `body` structure and `recoverSchema`. |
| `src/modules/auth/__tests__/auth.test.ts` | Integration test suite for all auth endpoints using `supertest`. |

**Routes file:** `src/routes/v1/auth.routes.ts`

---

## API Routes

Base prefix: `/api/v1/auth`

| Method | Path | Access | hCaptcha | Description |
|--------|------|--------|----------|-------------|
| `POST` | `/register` | Public | Yes | Register a new user account |
| `POST` | `/login` | Public | Yes | Authenticate with login/password |
| `POST` | `/recover` | Public | Yes | Recover password using backup code |
| `GET` | `/verify` | Public | No | Validate a Bearer token |
| `POST` | `/check-password-strength` | Public | No | Check password strength score |
| `GET` | `/generate-password` | Public | No | Generate a secure password recommendation |

### `POST /register`

Register a new user account. Returns user, JWT token, and one-time backup code.

**Request body:**
```json
{
  "hcaptchaToken": "<string>",
  "login": "<string, 3-50 chars, [a-zA-Z0-9_]>",
  "password": "<string, 8-128 chars>"
}
```

The `hcaptchaToken` is extracted and removed from the body before validation. Zod schema `registerSchema` from `validation/auth.schema.ts` validates the remaining fields.

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "login": "example" },
    "token": "<JWT>",
    "backupCode": "<32-char uppercase HEX>",
    "message": "SAVE THIS BACKUP CODE! You will need it to recover your password."
  }
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | Zod validation error — `{ "error": "Validation error", "details": [...] }` |
| 400 | Login already taken — `{ "error": "Login already taken" }` |
| 400 | Password too weak — detailed error with score and suggestions |
| 400 | hCaptcha verification failed |

### `POST /login`

Authenticate with login and password. Enforces constant-time delay to prevent timing attacks.

**Request body:**
```json
{
  "hcaptchaToken": "<string>",
  "login": "<string>",
  "password": "<string>"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "login": "example" },
    "token": "<JWT>"
  }
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | Zod validation error |
| 401 | Invalid credentials (user not found or wrong password) |

### `POST /recover`

Recover password using a backup code. Searches ALL users in the database to find the matching backup code, hashes a new password and backup code, and returns a new JWT.

**Request body:**
```json
{
  "hcaptchaToken": "<string>",
  "backup_code": "<32-char HEX>",
  "new_password": "<string>"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "backup_code": "<new 32-char HEX>",
    "message": "Password updated successfully"
  }
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid backup code |
| 400 | New password is too weak |

### `GET /verify`

Validate a Bearer token and return user identity.

**Headers:**
```
Authorization: Bearer <JWT>
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "login": "example" }
  }
}
```

**Error responses:**
| Status | Condition |
|--------|-----------|
| 401 | No token provided |
| 401 | Invalid or expired token |
| 401 | Token's user no longer exists in database |

### `POST /check-password-strength`

Evaluate password strength without storing it. Returns score, reasons, and suggestions.

**Request body:**
```json
{
  "password": "<string>"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "isStrong": true,
    "score": 92,
    "reasons": [],
    "suggestions": []
  }
}
```

### `GET /generate-password`

Generate a secure password recommendation using the Diceword/dixie pattern.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "password": "Purple-Monkey-Horse-Crystal-87!"
  }
}
```

Generated passwords follow the pattern: `<Word>-<Word>-<Word>-<Word>-<2-digit number><special char>`.

---

## Authentication Flows

### 1. Registration

```
1.  Client sends POST /register with { login, password, hcaptchaToken }
2.  hCaptcha middleware verifies token with hCaptcha API
3.  AuthController extracts hcaptchaToken, validates remaining body with Zod
4.  AuthService.register():
    a.  Check password strength — must score >= 70 with zero required-requirement failures
    b.  Check login uniqueness via UserRepository.existsByLogin()
    c.  Hash password: HMAC-SHA256(password, pepper) → bcrypt(peppered, salt)
    d.  Generate backup code: crypto.randomBytes(16) → HEX uppercase (32 chars)
    e.  Hash backup code with bcrypt
    f.  Create user via UserRepository.create() — INSERT with RETURNING
    g.  Sign JWT with { userId, login }
5.  Return { user: { id, login }, token, backupCode, message }
```

### 2. Login

```
1.  Client sends POST /login with { login, password, hcaptchaToken }
2.  hCaptcha middleware verifies token
3.  AuthController validates body with Zod loginSchema
4.  AuthService.login():
    a.  Record start time for timing attack protection
    b.  Find user by login via UserRepository.findByLogin()
    c.  If not found, throw "Invalid credentials"
    d.  Verify peppered password against stored hash
    e.  If invalid, throw "Invalid credentials"
    f.  Sign JWT with { userId, login }
    g.  [finally block] Enforce minimum 500ms delay: if elapsed < 500, sleep remainder
5.  Return { user: { id, login }, token }
```

**Timing attack prevention:** Both valid and invalid login attempts take at least 500ms, preventing attackers from distinguishing "user not found" from "wrong password" based on response time.

### 3. Update Password (via `updatePassword` method)

```
1.  AuthController receives { backupCode, newPassword }
2.  AuthService.updatePassword():
    a.  Query ALL users with non-null backup_code_hash (direct DB query)
    b.  Iterate through all users, verify backup code against each hash
    c.  If no match found, throw "Invalid backup code"
    d.  Check new password strength — must be strong
    e.  Hash new password with bcrypt + pepper
    f.  Generate new backup code and hash it
    g.  Update user: set new password_hash and backup_code_hash
    h.  Sign JWT for the found user
5.  Return { user: { id, login }, token, backupCode }
```

**Important:** The backup code verification scans all users in the database. Old backup codes are invalidated once updated.

### 4. Password Recovery

The `recover` endpoint delegates to `AuthService.updatePassword()`. The controller maps `backup_code` → `backupCode` and `new_password` → `newPassword` before calling the same method as password update.

### 5. Token Verification

```
1.  Client sends GET /verify with Authorization: Bearer <token>
2.  AuthController extracts token from header
3.  AuthService.validateToken():
    a.  jwtService.verify(token) → payload
    b.  UserRepository.findById(payload.userId)
    c.  If user not found, return null (user may have been deleted)
    d.  Return { id, login }
4.  Return { user: { id, login } } or 401 error
```

---

## Security

### Password Hashing

Passwords are hashed using a two-layer approach:

1. **Pepper (HMAC-SHA256):** The password is first processed through HMAC-SHA256 using the `PASSWORD_PEPPER` environment variable as the key. The pepper is stored in the environment (not the database), so a database breach alone does not compromise password hashes.

2. **Bcrypt:** The HMAC output (as base64) is then hashed with bcrypt at configurable salt rounds.

```typescript
// Simplified flow:
peppered = HMAC-SHA256(password, PASSWORD_PEPPER)  // Web Crypto API
hash = bcrypt.hash(peppered, BCRYPT_ROUNDS)
```

**Pepper configuration:**
- Environment variable: `PASSWORD_PEPPER`
- Minimum length: 32 characters
- Application fails to start if not set or too short

**Bcrypt configuration:**
- Environment variable: `BCRYPT_ROUNDS`
- Range: 10–15 (default: 12)
- Application fails to start if out of range

### Password Strength Requirements

| Requirement | Details |
|------------|---------|
| Minimum length | 12 characters |
| Maximum length | 128 characters (DoS protection) |
| Uppercase | At least one `[A-Z]` |
| Lowercase | At least one `[a-z]` |
| Digit | At least one `[0-9]` |
| Special characters | Suggested but not required (`!@#$%^&*()_+` etc.) |
| No spaces | Passwords cannot contain whitespace |
| Not common | Blocks: password, 123456, admin, qwerty, letmein, welcome, monkey, dragon, master, sunshine (case-insensitive) |
| No patterns | Blocks sequential patterns (123456, abcdef, qwerty, etc.), keyboard patterns, and reverse sequences |
| No repetition | Blocks 4+ identical consecutive characters and repeating pairs (abab) |
| Entropy check | Calculates entropy = `log2(poolSize^length) * uniqueness_ratio`; scored below 50 bits penalized |

**Scoring:** Passwords are scored 0–100. A password is "strong" only if score >= 70 AND there are zero mandatory failures.

### Backup Codes

- **Generation:** `crypto.randomBytes(16)` → 128 bits of entropy → uppercase hex string (32 characters)
- **Storage:** Hased with bcrypt, stored in `backup_code_hash` column
- **Case-insensitive:** Verification uppercases the input before comparison
- **One-time use:** Each password update generates a new backup code, rendering the old one invalid

### JWT Security

| Property | Value |
|----------|-------|
| Library | `jsonwebtoken` |
| Secret | `JWT_SECRET` environment variable (required, non-empty) |
| Expiration | `JWT_EXPIRES_IN` environment variable (default: `24h`) |
| Payload | `{ userId: number, login: string }` |
| Token format | `header.payload.signature` (standard JWT) |

The service throws an error at startup if `JWT_SECRET` is unset or equals the default placeholder value.

### Token Blacklisting

The `auth.middleware.ts` supports JWT blacklisting via Redis (`jwtBlacklist`). Tokens whose `jti` claim is in the blacklist are rejected with "Token has been revoked."

### Timing Attack Prevention

The login flow enforces a constant-time delay of at least 500ms regardless of whether the user exists or the password is correct. This prevents timing-based side-channel attacks.

```typescript
// In AuthService.login():
const startTime = Date.now();
try {
  // ... auth logic
} finally {
  const elapsed = Date.now() - startTime;
  if (elapsed < 500) {
    await this.delay(500 - elapsed);
  }
}
```

### SQL Injection Prevention

All database queries use parameterized queries via the `$1, $2, ...` placeholder syntax. The `UserRepository` never concatenates user input into SQL strings.

### hCaptcha Protection

The `register`, `login`, and `recover` endpoints require hCaptcha verification. The middleware is configurable:

| Environment Variable | Purpose |
|---------------------|---------|
| `HCAPTCHA_SECRET_KEY` | Secret key for hCaptcha server verification |
| `HCAPTCHA_ENABLED` | Set to `false` to disable (defaults to enabled) |
| `HCAPTCHA_FAIL_OPEN` | Set to `true` to allow requests on API failure (defaults to blocking) |

---

## Validation Schemas

### `src/modules/auth/validation/auth.schema.ts` (used by controller)

| Schema | Fields | Notes |
|--------|--------|-------|
| `registerSchema` | `login` (3-50 chars, `[a-zA-Z0-9_]+`), `password` (8-128 chars) | Enforced by Zod; strength checked by service |
| `loginSchema` | `login` (string), `password` (string) | Minimal validation |
| `updatePasswordSchema` | `backupCode` (string), `newPassword` (8-128 chars) | Strength checked by service |
| `checkPasswordStrengthSchema` | `password` (1-128 chars) | Used for strength check endpoint |

### `src/modules/auth/schemas/auth.schema.ts` (alternative)

Nested `body` structure. Contains `recoverSchema` with `login`, `backup_code`, and `new_password` fields with inline regex for uppercase, lowercase, and digit requirements. **Note:** The recover endpoint in `AuthController.recover()` does not currently use Zod schema validation — it destructures fields directly from `req.body`.

---

## Database Schema

### `users` table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Auto-increment user ID |
| `login` | `VARCHAR(50)` | UNIQUE, NOT NULL | Username (letters, digits, underscores) |
| `password_hash` | `TEXT` | NOT NULL | bcrypt hash of HMAC-SHA256(peppered password) |
| `backup_code_hash` | `VARCHAR(255)` | NULLABLE | bcrypt hash of backup code |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Account creation timestamp |
| `last_login` | `TIMESTAMP` | NULLABLE | Last successful login timestamp |

**Migration file:** `db/migrations/001_init.sql`

**Referenced by:** `nodes(user_id)` with `ON DELETE CASCADE`, `tags(user_id)` with `ON DELETE CASCADE`.

### UserRepository Methods

| Method | SQL | Purpose |
|--------|-----|---------|
| `existsByLogin(login)` | `SELECT EXISTS(SELECT 1 FROM users WHERE login = $1)` | Check login uniqueness for registration |
| `findByLogin(login)` | `SELECT * FROM users WHERE login = $1` | Fetch user for login |
| `findById(id)` | `SELECT * FROM users WHERE id = $1` | Fetch user for token validation |
| `create(data)` | `INSERT INTO users (...) VALUES ($1, $2, $3) RETURNING *` | Create new user account |
| `update(id, data)` | `UPDATE users SET password_hash = $1, backup_code_hash = $2 WHERE id = $3` | Update password and backup code |

---

## Error Handling

All controller methods follow a consistent error handling pattern:

1. **Zod validation errors:** Return 400 with `{ success: false, error: "Validation error", details: error.issues }`.
2. **Business logic errors:** Return appropriate status code with `{ success: false, error: errorMessage }`.
3. **Unexpected errors:** Logged via `logger.error()` and fall through to the generic error handler.

| Endpoint | Success | Validation Error | Business Error |
|----------|---------|-----------------|----------------|
| `register` | 201 | 400 | 400 |
| `login` | 200 | 400 | 401 |
| `recover` | 200 | 400 | 400 |
| `verify` | 200 | N/A | 401 |
| `check-password-strength` | 200 | 400 | 500 |
| `generate-password` | 200 | N/A | 500 |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PASSWORD_PEPPER` | Yes | None | HMAC-SHA256 key for password pepper (min 32 characters). Application fails if not set. |
| `BCRYPT_ROUNDS` | No | `12` | Bcrypt salt rounds (10–15). Higher = more secure but slower. |
| `JWT_SECRET` | Yes | `"your-super-secret-jwt-key-change-this-in-production"` | Secret key for JWT signing. Service throws if placeholder value is used. |
| `JWT_EXPIRES_IN` | No | `24h` | JWT expiration. Accepts string (`24h`, `7d`) or numeric seconds (`86400`). |
| `HCAPTCHA_SECRET_KEY` | Conditional | `""` | Secret key for hCaptcha verification. Required if hCaptcha is enabled. |
| `HCAPTCHA_ENABLED` | No | `true` | Set to `false` to disable hCaptcha (useful for development). |
| `HCAPTCHA_FAIL_OPEN` | No | `false` | Set to `true` to allow requests through when hCaptcha API is unreachable. |

---

## Testing

Test file: `src/modules/auth/__tests__/auth.test.ts`

The test suite uses `supertest` against the Express app and PostgreSQL via the connection pool.

### Test Categories

**Registration — Success:**
- Strong password registration
- Minimum 12-character password
- Passphrase with special characters
- Maximum length password acceptance

**Registration — Validation Errors:**
- Missing login / missing password
- Login too short (< 3 chars) / too long (> 50 chars)
- Invalid login characters (spaces, @, ., -, !)
- Duplicate login rejection

**Registration — Password Strength:**
- Missing uppercase / lowercase / digit
- Spaces in password
- Common passwords (password, admin, qwerty, welcome)
- Sequential patterns (123456, abcdef, qwerty)
- Repeating characters (aaaa, 1111)
- Password too long (> 128 chars)

**Login — Success and Errors:**
- Valid credentials login
- Timing attack protection (>= 450ms response)
- Non-existent user and wrong password (both return 401)
- Timing equality test (non-existent user vs wrong password differ < 200ms)

**Token Verification:**
- Valid token verification
- Missing token, invalid token, malformed Authorization header

**Password Recovery:**
- Recovery with valid backup code
- Login with new password after recovery
- Invalid backup code rejection
- Weak new password rejection

**Password Utilities:**
- Strength check returns score >= 70 for strong passwords
- Weak password returns detailed reasons and suggestions
- Missing password returns 400 error
- Generated password matches expected pattern and varies per request

**Security:**
- Passwords never appear in response bodies
- Different users get different backup codes
- SQL injection attempts blocked by parameterized queries
- Concurrent registrations succeed without conflicts

### Running Tests

```bash
# All auth tests
npm test -- --testPathPattern=auth

# With coverage
npm test -- --testPathPattern=auth --coverage
```

### Test Cleanup

The `beforeEach` hook soft-deletes test users (matching `test_%`, `testuser%`, `test-%`) along with their related data in `nodes`, `ai_analysis`, and `ai_images` tables.

---

## Common Patterns for AI/Developer Reference

### Adding a new auth endpoint

1. Add route in `src/routes/v1/auth.routes.ts`
2. Add Zod schema in `src/modules/auth/validation/auth.schema.ts`
3. Add method to `AuthController` class with try/catch and consistent JSON response format
4. Add business logic in `AuthService` class
5. Add tests in `src/modules/auth/__tests__/auth.test.ts`

### Accessing the current user in other modules

Use `auth.middleware.ts`'s `authenticate` middleware, which sets `req.userId` on the request:

```typescript
import { authenticate } from '../../shared/middleware/auth.middleware';

router.get('/protected', authenticate, someController.handler);
// Inside handler: req.userId is available
```

### Responding to clients

All auth endpoints follow the envelope pattern:

```json
// Success:
{ "success": true, "data": { ... } }

// Error:
{ "success": false, "error": "<message>", "details": [...] }
```