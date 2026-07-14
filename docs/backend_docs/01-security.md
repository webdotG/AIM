# Module 1: Security

## Overview

The Security module implements a layered sanitization pipeline that processes all incoming HTTP request data before it reaches business logic. It protects against XSS, SQL injection, command injection, path traversal, CRLF injection, SSTI, LDAP injection, XPath injection, and open redirect attacks.

**Location:** `src/security/`

---

## Architecture

```
HTTP Request
    → Sanitizer Middleware (Express)
        → Creates a Pipeline (SanitizerPipeline / AsyncSanitizerPipeline)
            → Executes sanitizers in sequence on body, query, params, headers
                → Each sanitizer: detect → sanitize → log → (optionally block)
    → Clean data passed to routes
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `SanitizerPipeline` | Sync pipeline — runs sanitizers sequentially |
| `AsyncSanitizerPipeline` | Async pipeline — same, supports async sanitizers |
| `BaseSanitizer` | Abstract class — defines `sanitize()` and `shouldSanitize()` |
| `SanitizerMiddleware` | Express middleware factory — plugs pipeline into request cycle |
| `SecurityViolationError` | Error class — thrown when attack detected and blocked |
| `SecurityLogger` | Winston-based logger for security events |
| `ATTACK_PATTERNS` | RegExp patterns library for all attack types |

---

## Pipeline Execution

Both pipelines provide:
- `execute(input)` — sanitizes a single value
- `executeDeep(input)` — recursively sanitizes nested objects/arrays

**Error handling:** If a sanitizer throws (non-blocked), the pipeline continues to next sanitizer. If `SecurityViolationError` with `blocked=true` is thrown, the pipeline stops and returns HTTP 400.

---

## Sanitizers

### Shared Sanitizers
| Sanitizer | Purpose |
|-----------|---------|
| `TrimSanitizer` | Removes leading/trailing whitespace |
| `LengthSanitizer` | Enforces max string length (configurable, strict mode blocks) |
| `EncodingSanitizer` | Normalizes encoding, detects double-encoding |

### Reflected Attack Sanitizers
| Sanitizer | Attacks Blocked |
|-----------|-----------------|
| `XSSSanitizer` | Script tags, event handlers, javascript: URIs, HTML escaping |
| `CommandInjectionSanitizer` | Shell commands, pipe chains, shell metacharacters |
| `PathTraversalSanitizer` | `../`, encoded traversal, null bytes |
| `CRLFSanitizer` | Carriage return / line feed injection |

### Search Attack Sanitizers
| Sanitizer | Attacks Blocked |
|-----------|-----------------|
| `SQLInjectionSanitizer` | SQL keywords, OR/AND tricks, time-based, file operations |

---

## Attack Patterns (`src/security/utils/patterns.ts`)

ATTACK_PATTERNS contains RegExp arrays for:
- `SQL_INJECTION` (10 patterns)
- `XSS` (14 patterns)
- `COMMAND_INJECTION` (7 patterns)
- `PATH_TRAVERSAL` (9 patterns)
- `CRLF` (8 patterns)
- `SSTI` (8 patterns)
- `OPEN_REDIRECT` (5 patterns)
- `LDAP_INJECTION` (5 patterns)
- `XPATH_INJECTION` (6 patterns)

---

## Presets

Presets pre-configure pipelines for different contexts:

| Preset | Pipeline Type | Sanitizers | Typical Use |
|--------|--------------|------------|-------------|
| `apiPreset` | Async | Trim → Length → Encoding → SQLi → XSS → Command → Path → CRLF | Default API, all endpoints |
| `userInputPreset` | Sync | Same as `apiPreset` | User-generated content |
| `searchPreset` | Sync | Trim → Length → Encoding → SQLi | Search queries |
| `authPreset` | Async | All sanitizers, strict mode, max length 100 | Login/register |

---

## Middleware Integration

In `src/index.ts`:
```typescript
app.use(createSanitizerMiddleware({
  preset: 'api',
  debug: process.env.NODE_ENV === 'development',
  maxLength: 10000,
  skipPaths: ['/health', '/favicon.ico'],
}));
```

Sanitizes `req.body`, `req.query`, `req.params`, and string headers deep-recursive.

---

## Security Logging

`SecurityLogger` writes to:
- Console: always
- `logs/security/warn.log`: warn+ level (non-test)
- `logs/security/error.log`: error+ level (non-test)

Each log entry includes: timestamp, sanitizer name, level, blocked flag, input/output (truncated to 200 chars), optional userId/ip/userAgent.

---

## Threat Coverage Summary

| Threat | Covered By |
|--------|-----------|
| XSS | `XSSSanitizer` (tag removal, attribute stripping, HTML escaping) |
| SQL Injection | `SQLInjectionSanitizer` (keyword removal, comment stripping, encoding) |
| Command Injection | `CommandInjectionSanitizer` (shell metacharacter detection) |
| Path Traversal | `PathTraversalSanitizer` (dot-dot, encoded variants, null bytes) |
| CRLF Injection | `CRLFSanitizer` (CR/LF in raw and encoded forms) |
| SSTI | Patterns defined; no dedicated sanitizer active in presets |
| LDAP/XPath Injection | Patterns defined; no dedicated sanitizer active in presets |
| Open Redirect | Patterns defined; no dedicated sanitizer active in presets |
| Rate Limiting | `express-rate-limit` in `rateLimiter.middleware.ts` + Redis `RedisRateLimiter` |
| Token Revocation | `JWTBlacklistService` (Redis-based) |
| Password Security | `PasswordHasher` (bcrypt + pepper) — see Auth module |