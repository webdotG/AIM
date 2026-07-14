# Security Architecture

AIM uses a defense-in-depth approach with multiple security layers.

## Backend security

### Authorization

| Mechanism | Implementation |
|-----------|---------------|
| JWT | Bearer token in `Authorization` header |
| Password | bcrypt (12 salt rounds) + HMAC-SHA256 pepper |
| Compare codes | 32 hex chars (crypto.randomBytes(16)) |
| Validation timing | Constant-time delay (500ms min) prevents timing attacks |
| Blacklist | Redis-based JWT revocation with TTL |

### Rate limiting

| Route | Limit | Window |
|-------|-------|--------|
| General | 100 requests | 15 min |
| Auth login/register/recover | 5 attempts | 15 min |
| Search | 30 requests | 1 min |
| AI | 10 requests | 1 min |

### hCaptcha

- **Protected**: register, login, recover
- **Fail-open** mode configurable via `HCAPTCHA_FAIL_OPEN=true`
- **Dev mode**: bypassed with `dev-mode-bypass-token`

### Input sanitization

| Threat | Backend sanitizer | Frontend sanitizer |
|--------|------------------|-------------------|
| XSS | ✅ | ✅ |
| SQL Injection | ✅ | ✅ |
| Command Injection | ✅ | — |
| Path Traversal | ✅ | — |
| CRLF Injection | ✅ | — |
| NoSQL Injection | — | ✅ |
| CSRF | — | ✅ |
| Open Redirect | — | ✅ |
| XXE | — | ✅ |
| File Upload | — | ✅ |
| Formula Injection | — | ✅ |
| PF Injection | — | ✅ |

### PostgreSQL constraints

| Constraint | Enforcement |
|------------|-------------|
| **Force delete prevention** | TRIGGER: `prevent_node_hard_delete` |
| **Node type consistency** | TRIGGER: `check_node_type_consistency` |
| **Measurement type check** | TRIGGER: `check_measurement_type` |
| **Self-edge prevention** | CHECK: `from_node_id <> to_node_id` |
| **Confidence range** | CHECK: `confidence BETWEEN 0 AND 1` |
| **Weight non-negative** | CHECK: `weight >= 0` |

## Security helpers

```typescript
Backend:
  createSanitizerMiddleware()
  createUserInputPreset(), createApiPreset(), createAuthPreset()
  SecurityLogger, ATTACK_PATTERNS, rateLimiters

Frontend:
  SecurityHelper.createEntryContentPipeline()
  SecurityHelper.createUserInputPipeline()
  SecurityHelper.quickSanitize()
  SecurityHelper.detectAttacks()
```

## More details

- [Backend Security Details](../backend_docs/01-security.md)
- [Frontend Security Details](../frontend_docs/06-security.md)