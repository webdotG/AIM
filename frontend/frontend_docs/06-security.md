# Frontend Security Module

## Overview

The frontend security module is a defense-in-depth layer that sanitizes all user input before sending to the backend. It mirrors the backend security module while adding frontend-specific checks: XSS prevention, CSRF token validation, DOM-based attack detection, and file upload verification.

The module follows a pipeline architecture: individual sanitizers compose into multi-stage pipelines, which are assembled into named presets for common use cases. Schema validators enforce structural rules independently of content sanitization.

    User Input --> SanitizerPipeline (stages) --> Sanitized Output
                    |
                    v
                SchemaValidator --> Validation Result
                    |
                    v
                SecurityLogger --> Console + Server (sendBeacon)

## Table of Contents

- [Module Structure](#module-structure)
- [Pipeline System](#pipeline-system)
  - [SanitizerPipeline](#sanitizerpipeline)
  - [AsyncSanitizerPipeline](#asyncsanitizerpipeline)
  - [Pipeline Presets](#pipeline-presets)
- [Sanitizers](#sanitizers)
  - [Base Sanitizer](#base-sanitizer)
  - [Shared Sanitizers](#shared-sanitizers)
  - [Frontend Sanitizers](#frontend-sanitizers)
  - [Reflected Sanitizers](#reflected-sanitizers)
  - [Search Sanitizers](#search-sanitizers)
  - [File Sanitizers](#file-sanitizers)
  - [Structured Sanitizers](#structured-sanitizers)
  - [Proxy Sanitizers](#proxy-sanitizers)
- [Schema Validators](#schema-validators)
- [Utilities](#utilities)
- [SecurityHelper](#securityhelper)
- [Sanitizer Matrix](#sanitizer-matrix)
- [Threat Coverage](#threat-coverage)

---

## Module Structure

```
frontend/src/security/
-- index.js                          Public API barrel export + SecurityHelper
-- sanitizers/
   -- base/
      |-- BaseSanitizer.js           Abstract base class
   -- shared/
      |-- TrimSanitizer.js           Whitespace normalization
      |-- LengthSanitizer.js         Min/max length enforcement
      |-- HTMLSanitizer.js           Tag/attribute stripping + entity encoding
      |-- URLSanitizer.js            URL validation (stub)
   -- frontend/
      |-- XSSSanitizer.js            XSS protection (stub)
      |-- CSRFSanitizer.js           CSRF token validation
   -- reflected/
      |-- OpenRedirectSanitizer.js   Open redirect prevention (stub)
      |-- XSSSanitizer.js            XSS detection (stub)
      |-- XSSISanitizer.js           Cross-Site Inclusion (stub)
   -- search/
      |-- SQLInjectionSanitizer.js   SQL injection protection (stub)
      |-- NoSQLInjectionSanitizer.js NoSQL injection (stub)
   -- files/
      |-- FileUploadSanitizer.js     File type, size, magic bytes
      |-- FormulaInjectionSanitizer.js Excel formula prefix strip
      |-- PDFInjectionSanitizer.js   PDF JavaScript action stripping
      |-- ServerSideXSSSanitizer.js  Server-Side XSS in filenames
   -- structured/
      |-- XXESanitizer.js            XXE protection (stub)
      |-- JWTValidator.js            JWT validation (stub)
   -- proxies/
      |-- HopByHopHeadersSanitizer.js Hop-by-hop header abuse prevention
-- pipelines/
   |-- SanitizerPipeline.js          Sequential stage pipeline
   |-- AsyncSanitizerPipeline.js     Sequential + parallel stages
   -- presets/
      |-- userInputPreset.js         General user input
      |-- authPreset.js              Auth flows
      |-- apiPreset.js               API request hardening
      |-- searchPreset.js            Search query sanitization
      |-- formPreset.js              Form submission
      |-- entryContentPreset.js      Rich text entry content
      |-- fileUploadPreset.js        File upload chain
      |-- imagePreset.js             Image upload chain
      |-- adminPreset.js             Admin panel hardening
-- validators/
   |-- InputValidator.js              Stub validator
   |-- SchemaValidator.js             Schema-driven field validation
   -- schemas/
      |-- index.js                    Barrel export
      |-- authSchema.js               register/login/resetPassword/changePassword/updateProfile/jwt
      |-- entrySchema.js              content/entry_type/event_date/deadline
      |-- fileUploadSchema.js         upload/image/document/avatar
      |-- searchSchema.js             general/advanced/autocomplete/users/tags
      |-- userInputSchema.js          text/number/email/url/datetime/select/boolean/file/array
-- utils/
   |-- patterns.js                    Regex constants + PatternValidator
   |-- encoders.js                    HTML/URL/JS/JSON/Base64 encode/decode
   |-- detectors.js                   AttackDetector + InputClassifier
   |-- logger.js                      SecurityLogger (console + sendBeacon)
```

---

## Pipeline System

### SanitizerPipeline

`SanitizerPipeline` (`pipelines/SanitizerPipeline.js`) is the core sequential engine. Stages execute in order, each receiving the output of the previous stage.

```javascript
class SanitizerPipeline {
  constructor(name = 'default') {
    this.name = name;
    this.stages = [];
    this.context = {};
  }
  addStage(sanitizer, stageName = '') { /* chainable */ }
  async execute(input, context = {}) { /* sequential execution */ }
}
```

**execute(input, context)**
- Iterates stages sequentially
- Each stage calls `sanitizer.sanitize(result)`
- Benchmarks each stage with `performance.now()`; warns if any stage exceeds 100 ms
- On error, logs at `console.error` and throws (pipeline is all-or-nothing)

**Static factory methods:**
- `createTextPreset()` -- HTMLSanitizer + XSSSanitizer + TrimSanitizer
- `createUserInputPreset()` -- SQLInjectionSanitizer + XSSSanitizer + Encoding + Length

```
+-------------+     +-------------+     +-------------+
|  Stage 1    |---->|  Stage 2    |---->|  Stage N    |
|   (Trim)    |     |  (Length)   |     |  (XSS etc)  |
+-------------+     +-------------+     +-------------+
                                           |
                                           v
                                      Sanitized output
```

### AsyncSanitizerPipeline

`AsyncSanitizerPipeline` (`pipelines/AsyncSanitizerPipeline.js`) extends `SanitizerPipeline` with parallel execution via `Promise.allSettled`.

```javascript
class AsyncSanitizerPipeline extends SanitizerPipeline {
  addParallelStage(sanitizer, stageName = '') { /* ... */ }
  mergeResults(original, processed) { /* last-writer-wins default */ }
}
```

**Execution:** Sequential stages run first, then all parallel stages run concurrently against the same input via `Promise.allSettled`. Any rejection throws. Results merge via `mergeResults()` (last-writer-wins default).

```
Sequential: Stage1 --> Stage2 --> +-------------------+
                                          | Parallel    |
                                        +v-----+--v-----+
                                       | ST-A  | ST-B |  --> Merged
                                        +-------+-------+
```

### Pipeline Presets

Nine presets ship for common scenarios.

| # | Preset | Pipeline Type | Stages | Use Case |
|---|--------|---------------|--------|----------|
| 1 | **userInputPreset** | SanitizerPipeline | 8 sub-pipelines (text, html-content, number, email, url, datetime, select, file-meta) | General purpose |
| 2 | **authPreset** | SanitizerPipeline | 6 sub-pipelines + sanitizeAuthData() | Login/register/reset/change-password |
| 3 | **apiPreset** | AsyncSanitizerPipeline | HopByHopHeaders, RateLimitEnforcer, JWTValidator, CSRFProtector, SQLI, NoSQLI | API hardening |
| 4 | **searchPreset** | SanitizerPipeline | Trim, SQLI, NoSQLI, XPATHI, ReDoS | Search queries |
| 5 | **formPreset** | SanitizerPipeline | CSRFProtector, XSS, HTML, EncodingSanitizer | Form submission |
| 6 | **entryContentPreset** | SanitizerPipeline | Trim, Length(10000), HTML(b,i,u,p,br), XSS | Rich-text entries |
| 7 | **fileUploadPreset** | AsyncSanitizerPipeline | FileUpload, PathTraversal, FormulaInjection, ServerSideXSS | File uploads |
| 8 | **imagePreset** | SanitizerPipeline | FileUpload(jpg/png/gif, 5MB, magic bytes) | Image uploads |
| 9 | **adminPreset** | AsyncSanitizerPipeline | SQLI, XSS, CSRF, PathTraversal, CommandInjection, IDOR | Admin panel |

#### userInputPreset Detail

`createUserInputPreset(config)` returns a pipeline with registered presets for each input type.

- **text** -- Trim, Length, XSS, HTML (or full escape), spam/bot detection (>3 URLs, >2 spam words, 10+ repeated chars, >50% caps in long strings)
- **html-content** -- Length, XSS, HTML with allowed tags+attributes, URL audit. Links get `rel="noopener noreferrer"`, images get `loading="lazy"`
- **number** -- Parse, type check, integer-only, range, MAX_SAFE_INTEGER
- **email** -- Trim, pattern, length (254 max, local <= 64), disposable domain block, suspicious prefix block
- **url** -- Trim, URLSanitizer, redirect-parameter scan (redirect/return/url/next/goto)
- **datetime** -- Trim, parse, validity, range (1900 to now+10y; future <= now+1y)
- **select** -- Enum check, multi-select with uniqueness and cardinality
- **file-meta** -- File validation, dangerous chars, extension blacklist, MIME check, size

Dangerous file extensions blocked: `exe`, `bat`, `cmd`, `sh`, `php`, `py`, `js`, `jar`, `war`, `dll`, `so`, `bin`.

#### authPreset Detail

`sanitizeAuthData(data, type)` dispatches based on `type`:

| type | Fields |
|------|--------|
| `register` | username, email, password |
| `login` | usernameOrEmail, password |
| `reset-password` | email, token, newPassword |
| `change-password` | currentPassword, newPassword |

The **password** sub-pipeline enforces: >= 8 chars, uppercase, lowercase, digit, special char. Rejects 7 common passwords and 19 sequential substrings (123, abc, qwe, etc).

---

## Sanitizers

### Base Sanitizer

`BaseSanitizer` (`sanitizers/base/BaseSanitizer.js`) defines the contract for all sanitizers (81 lines).

```javascript
class BaseSanitizer {
  constructor(options = {}) {
    this.options = { throwOnError: true, logLevel: 'warn', ...options };
  }
  async sanitize(input)       // Wraps process() in try/catch
  async process(input)        // Abstract -- must override
  handleError(error, input)   // Default: return original
  log(message, level = 'debug') // Conditional console output
  containsDangerousChars(str) // 14-pattern heuristic
}
```

`containsDangerousChars()` checks 14 regex patterns: `<script>`, `javascript:`, `data:`, `vbscript:`, `on*=` handlers, `exec`, `union`, `select`, `insert`, `delete`, `update`, SQL comments `--` and `/* */`, and `;`.

### Shared Sanitizers

#### TrimSanitizer

`sanitizers/shared/TrimSanitizer.js` (32 lines).

| Option | Default | Description |
|--------|---------|-------------|
| `trimStart` | `true` | Remove leading whitespace |
| `trimEnd` | `true` | Remove trailing whitespace |
| `collapseSpaces` | `true` | Collapse whitespace runs to single space |

Non-string input passes through unchanged.

#### LengthSanitizer

`sanitizers/shared/LengthSanitizer.js` (32 lines).

| Option | Default | Description |
|--------|---------|-------------|
| `maxLength` | `1000` | Maximum allowed length |
| `minLength` | `0` | Minimum allowed length |
| `truncate` | `true` | Truncate or throw on overflow |

Below `minLength` always throws. Above `maxLength` throws or truncates based on `truncate`.

#### HTMLSanitizer

`sanitizers/shared/HTMLSanitizer.js` (92 lines).

Default allowed tags: `p`, `b`, `i`, `u`, `em`, `strong`, `br`, `h1`-`h6`, `ul`, `ol`, `li`, `blockquote`.

Default allowed attributes:
- `*` -> `class`, `style`
- `a` -> `href`, `title`, `target`
- `img` -> `src`, `alt`, `title`, `width`, `height`

**Process:**
1. `removeDangerousTags()` -- strips tags not in allowedTags
2. `removeDangerousAttributes()` -- strips `on*` handlers and dangerous URL attributes (javascript:, data:, vbscript:)
3. `escapeHTML()` -- encodes 7 special chars: `& < > " ' /` to HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#x27;`, `&#x2F;`)

#### URLSanitizer

`sanitizers/shared/URLSanitizer.js` -- stub; returns input unchanged.

### Frontend Sanitizers

#### CSRFSanitizer

`sanitizers/frontend/CSRFSanitizer.js` (49 lines).

| Option | Default | Description |
|--------|---------|-------------|
| `tokenHeader` | `X-CSRF-Token` | Header name for token |
| `methods` | `['POST', 'PUT', 'DELETE', 'PATCH']` | Protected HTTP methods |

**Process:** Skips non-matching methods, extracts token from header/body/query, compares against `req.session.csrfToken`, strips `_csrf` from input object, throws on mismatch.

#### XSSSanitizer (Frontend)

`sanitizers/frontend/XSSSanitizer.js` -- stub.

> The presets reference XSSSanitizer options like `stripScriptTags`, `stripInlineEvents`, `stripJavaScriptProtocols`, etc. that describe the *intended* API. Current implementation is a placeholder awaiting full XSS-detection logic.

### Reflected Sanitizers

All three are stubs awaiting implementation:

| Sanitizer | File | Purpose |
|-----------|------|---------|
| `OpenRedirectSanitizer` | `reflected/OpenRedirectSanitizer.js` | Block open redirect patterns |
| `XSSSanitizer` | `reflected/XSSSanitizer.js` | Detect and clean XSS |
| `XSSISanitizer` | `reflected/XSSISanitizer.js` | Cross-Site Inclusion via URL params |

### Search Sanitizers

Both are stubs:

| Sanitizer | File | Purpose |
|-----------|------|---------|
| `SQLInjectionSanitizer` | `search/SQLInjectionSanitizer.js` | Detect SQL keywords and patterns |
| `NoSQLInjectionSanitizer` | `search/NoSQLInjectionSanitizer.js` | Detect NoSQL operators ($gt, $regex, etc.) |

### File Sanitizers

#### FileUploadSanitizer

`sanitizers/files/FileUploadSanitizer.js` (76 lines).

| Option | Default | Description |
|--------|---------|-------------|
| `allowedTypes` | `[]` | MIME types (empty = allow all) |
| `maxSize` | 10 MB | Maximum file size |
| `checkMagicBytes` | `false` | Validate header against declared MIME |

**Process:** Verify File object, check MIME type, check size, optionally read first 4 bytes for magic byte verification, sanitize filename (replace non-alphanumeric except dot/dash with `_`).

Magic byte signatures:

| Hex | MIME |
|-----|------|
| `89504e47` | `image/png` |
| `ffd8ffe0` / `ffd8ffe1` | `image/jpeg` |
| `47494638` | `image/gif` |
| `52494646` | `image/webp` |

Mismatch between detected and declared MIME type throws.

#### FormulaInjectionSanitizer

`sanitizers/files/FormulaInjectionSanitizer.js` (28 lines).

Strips dangerous Excel/LibreOffice formula prefixes (`=`, `+`, `-`, `@`, tab, CR) from string start and escapes remaining leading occurrences with backslash.

#### PDFInjectionSanitizer

`sanitizers/files/PDFInjectionSanitizer.js` (16 lines).

Escapes PDF action keywords: `/JavaScript`, `/JS`, `/Launch`, `/URI` (prefixed with backslash).

#### ServerSideXSSSanitizer

`sanitizers/files/ServerSideXSSSanitizer.js` (19 lines).

HTML-encodes server-side template markers in filenames/metadata:

| Pattern | Encoded |
|---------|---------|
| `<?php` | `&lt;?php` |
| `<?=` | `&lt;?=` |
| `<?` | `&lt;?` |
| `?>` | `?&gt;` |
| `<%` / `%>` | `&lt;%` / `%&gt;` |

### Structured Sanitizers

Both are stubs:

| Sanitizer | File | Purpose |
|-----------|------|---------|
| `XXESanitizer` | `structured/XXESanitizer.js` | Detect XML External Entity patterns |
| `JWTValidator` | `structured/JWTValidator.js` | Validate JWT token format and signature |

### Proxy Sanitizers

#### HopByHopHeadersSanitizer

`sanitizers/proxies/HopByHopHeadersSanitizer.js` (280 lines). The most fully implemented sanitizer in the frontend module.

Prevents hop-by-hop header abuse attacks where an attacker manipulates the `Connection` header to strip critical security headers at a proxy or load balancer. Based on [RFC 2616](https://www.rfc-editor.org/rfc/rfc2616#section-13.5.1) and OWASP guidance.

| Option | Default | Description |
|--------|---------|-------------|
| `strict` | `true` | Remove `Connection` header on any violation |
| `logSuspicious` | `true` | Log security events for monitoring |

**Protected headers** (must never be declared hop-by-hop): `authorization`, `cookie`, `x-forwarded-for`, `x-real-ip`, `x-original-url`, `x-rewrite-url`, `x-forwarded-host`, `x-forwarded-proto`, `x-forwarded-server`, `x-http-method-override`, `x-auth-token`, `api-key`, `x-api-key`.

**Standard hop-by-hop headers** (RFC 2616): `connection`, `keep-alive`, `transfer-encoding`, `te`, `trailer`, `upgrade`, `proxy-authorization`, `proxy-authenticate`.

**Detection flow:**
1. Normalize all header keys to lowercase
2. Parse `Connection` header into declared hop-by-hop list
3. Check each against protected set -> `protected_header_abuse` (severity: high)
4. Check for >10 declared -> `excessive_hop_by_hop` (severity: medium)
5. Check against suspicious patterns (auth, token, api, key, session, forwarded, real-ip, original) -> `suspicious_pattern` (medium)
6. Strict mode: remove entire `Connection` header on any violation
7. Non-strict: filter `Connection` to retain only standard hop-by-hop values

Sensitive headers (`authorization`, `cookie`, `api-key`, `x-api-key`) are `[REDACTED]` in log output.

---

## Schema Validators

### SchemaValidator

`validators/SchemaValidator.js` (123 lines). Validates data structures against field-level schemas.

```javascript
class SchemaValidator {
  constructor(schemas = {}) { /* ... */ }
  registerSchema(name, schema) { /* chainable */ }
  async validate(schemaName, data, options = {}) { /* ... */ }
}
```

**validate(schemaName, data)** returns `{ valid: true/false, errors: [{ field, errors: [message, ...] }, ...] }`.

With `throwOnError: true`, throws `ValidationError` (extends Error with `errors` array).

**validateField constraints:**

| Constraint | Types | Description |
|------------|-------|-------------|
| `required` | all | Must not be undefined/null/empty string |
| `type` | all | One of: string, number, boolean, array, object, date |
| `minLength` / `maxLength` | string | Count bounds |
| `pattern` | string | Regex `.test(value)` |
| `min` / `max` | number | Numeric bounds |
| `enum` | any | Value must be in provided array |
| `validate(value, fullData)` | all | Custom async validator (returns string, array, or null) |

### Schema Definitions

#### authSchema

`schemas/authSchema.js` (219 lines). Six sub-schemas.

| Schema | Key Fields |
|--------|------------|
| **register** | username (3-30, alphanumeric/underscore/dash, no admin/root), email (no disposable domains), password (strength rules), confirmPassword (must match), firstName/lastName (Cyrillic + Latin), agreeToTerms (required boolean) |
| **login** | usernameOrEmail (max 100), password (max 100), rememberMe (optional) |
| **resetPassword** | email, token (32-char hex), newPassword, confirmPassword |
| **changePassword** | currentPassword, newPassword (must differ from current), confirmPassword |
| **updateProfile** | firstName, lastName, email, bio (max 500), avatar (base64 image) |
| **jwt** | accessToken, refreshToken (three base64url-dot-separated segments) |

Password rules: uppercase + lowercase + digit + special char. Blocked: `password`, `123456`, `qwerty`, `admin`.

#### entrySchema

`schemas/entrySchema.js` (67 active lines).

| Field | Rules |
|-------|-------|
| `content` | Required, 1-10000 chars; >= 3 non-whitespace chars; rejects repeated patterns |
| `entry_type` | Enum: dream, memory, thought, plan |
| `event_date` | Must parse; not in future unless type is plan |
| `deadline` | Required for plans; must parse; not in past |

#### fileUploadSchema

`schemas/fileUploadSchema.js` (241 lines). Four sub-schemas.

| Schema | Key Rules |
|--------|-----------|
| **upload** | file (object with originalname/buffer/mimetype/size; max 10 MB; 10 MIME types), purpose (enum), maxDimensions, allowedExtensions |
| **image** | 5 image MIMEs; magic-byte check (jpg/png/gif/webp/svg); max dims 5000; compress (default true) |
| **document** | 7 doc MIMEs; PDF header check; Office macro/VBA scan; maxPages (max 100); passwordProtected must be false |
| **avatar** | 4 image MIMEs; max 2 MB; min 100 bytes; crop 50-1000; square (default true) |

#### searchSchema

`schemas/searchSchema.js` (235 lines). Five sub-schemas.

| Schema | Key Rules |
|--------|-----------|
| **general** | query (2-100 chars; no SQL/XSS/NoSQL; <= 30% special chars), page <= 100, limit <= 100, filters (<= 5 nesting, <= 1000 chars) |
| **advanced** | keywords (2-200); dateRange (max 1 year); contentType (max 5); language (xx or xx-XX) |
| **autocomplete** | query (1-50; no admin/root/password/secret/token/key/../../etc.) |
| **users** | username/email/role; limit <= 50 |
| **tags** | tag (2-30 alphanumeric) |

#### userInputSchema

`schemas/userInputSchema.js` (541 lines). Nine sub-schemas.

| Schema | Key Rules |
|--------|-----------|
| **text** | value max 5000; XSS/SQL/NoSQL/command-injection checks; repeated char and URL limits |
| **number** | finite; <= MAX_SAFE_INTEGER; suspicious large integer (>1M) |
| **email** | max 254; local <= 64, domain <= 253; disposable + suspicious domains |
| **url** | max 2000; protocol whitelist; domain blacklist; no IPs; redirect-param scan |
| **datetime** | range 1900 to now+10y; suspicious timestamp heuristic |
| **select** | enum check; injection-character scan (;, --, /*) |
| **boolean** | accepts true/false/1/0/yes/no strings |
| **file** | MIME/extension/size/buffer; magic bytes for images; 5 MB default |
| **array** | cardinality; uniqueness; per-item length (max 1000 chars) |

---

## Utilities

### Pattern Library

`utils/patterns.js` (125 lines). 17 precompiled regex patterns + PatternValidator class.

| Pattern | Description |
|---------|-------------|
| `EMAIL` | Standard email with 2+ char TLD |
| `USERNAME` | 3-30 alphanumeric/underscore/dash |
| `PASSWORD_STRONG` | Min 8 chars: lowercase + uppercase + digit |
| `PHONE_RU` | Russian +7 format |
| `URL` | Web URL (optional protocol) |
| `IP` | IPv4 address |
| `UUID` | UUID v4 |
| `DATE_ISO` | YYYY-MM-DD |
| `BASE64` | RFC 4648 Base64 with padding |
| `NO_HTML` | No angled brackets |
| `ALPHANUMERIC_SPACES` | Letters, digits, whitespace only |
| `RUSSIAN_TEXT` | Cyrillic + punctuation |
| `HEX_COLOR` | #RGB or #RRGGBB |
| `JWT` | Three dot-separated base64url segments |
| `FILE_PATH` | Safe path characters |
| `NO_SQL` | Negative lookahead: rejects SQL keywords |
| `NO_XSS` | Negative lookahead: rejects script/XSS patterns |

**PatternValidator methods:** `validate(value, name)`, `sanitize(value, name)`, `validateMultiple(value, names[])`, `getPatternDescription(name)`.

### Encoders

`utils/encoders.js` (159 lines). `Encoder` static class + `EncodingSanitizer` pipeline stage.

| Method | Description |
|--------|-------------|
| `htmlEncode(str)` | 7-char entity encoding: & < > " ' / |
| `htmlDecode(str)` | Reverse entity decode |
| `urlEncode(str)` | Percent encoding with extra escaping |
| `urlDecode(str)` | Reverse; + -> space; fallback on error |
| `base64Encode/Decode` | UTF-8-safe Base64 |
| `jsEncode(str)` | JS string escape: \ ' " \n \r \t |
| `jsonEncode/Decode` | Stringify/parse with error handling |

**EncodingSanitizer** accepts `encodeFor` (html/url/js/json/base64) and `decodeFirst` options.

### Attack Detectors

`utils/detectors.js` (126 lines). Two classes.

**AttackDetector** -- 5 static methods:

| Method | Returns true when |
|--------|------------------|
| `detectSQLInjection` | SQL keywords found AND length > 1000 with quote char |
| `detectXSS` | Any: `<script>`, `javascript:`, `on*=`, `expression(`, `<iframe>`, `<object>`, `<embed>` |
| `detectCommandInjection` | Any: `; cmd`, `| cmd`, `&& cmd`, `$()`, backticks |
| `detectSSRF` | localhost, 127.0.0.1, private IPs (192.168.*, 10.*, 172.16-31.*), file://, gopher://, dict:// |
| `detectPathTraversal` | ../, ..\\, /etc/passwd, /proc/self, \Windows\ |

**InputClassifier:**

| Method | Description |
|--------|-------------|
| `classify(input)` | Returns array of attack type strings |
| `getRiskLevel(classifications)` | Returns high/medium/low/none |

Risk levels: high (sql-injection, command-injection), medium (xss, path-traversal), low (ssrf).

### Security Logger

`utils/logger.js` (151 lines).

```javascript
class SecurityLogger {
  constructor(options = {}) // enabled, logLevel, includeStackTrace, maxMessageLength, maxLogs
  debug/info/warn/error(message, data = {})
  security(event, data) // auto-adds userAgent, url, timestamp
}
```

**Options:** `enabled` (bool), `logLevel` (default: warn), `includeStackTrace`, `maxMessageLength` (1000), `maxLogs` (1000).

**Features:**
- Sensitive field redaction: password, token, secret, key, auth, credit_card, cvv, ssn, passport -> `[REDACTED]`
- Strings longer than 100 chars truncated to 100 + `...`
- `security()` and `error()` level logs sent to server via `navigator.sendBeacon` (or fetch fallback) to `/api/security-logs`
- In-memory log buffer with `getLogs(filter)` and `clear()`
- Exported singleton `securityLogger`: enabled in dev (debug level), production (warn level)

---

## SecurityHelper

`index.js` -- barrel export class with static helper methods.

| Method | Signature | Description |
|--------|-----------|-------------|
| `createEntryContentPipeline()` | async | Returns userInputPreset with maxLength 10000, allowed HTML tags (p,b,i,u,em,strong,br,h1-h6,ul,ol,li,blockquote) |
| `createUserInputPipeline()` | async | Returns default userInputPreset |
| `quickSanitize(text)` | async | Shortcut: creates pipeline and runs text through it |
| `detectAttacks(input)` | sync | Returns InputClassifier.classify(input) |

The barrel export re-exports all sanitizer classes, `SchemaValidator`, attack detector utilities, and `SecurityHelper`.

---

## Sanitizer Matrix

Coverage across sanitizer categories. Values marked `(stub)` are placeholder implementations.

| Threat | Shared | Frontend | Reflected | Search | Files | Structured | Proxy |
|--------|--------|----------|-----------|--------|-------|------------|-------|
| XSS | HTMLSanitizer | XSSSanitizer (stub) | XSSSanitizer (stub) | | ServerSideXSS | | |
| CSRF | | CSRFSanitizer | | | | | |
| SQL Injection | | | | SQLI (stub) | | | |
| NoSQL Injection | | | | NoSQLI (stub) | | | |
| Open Redirect | | | OpenRedirect (stub) | | | | |
| XXE | | | | | | XXE (stub) | |
| Formula Injection | | | | | FormulaInjection | | |
| PDF Injection | | | | | PDFInjection | | |
| File Upload | | | | | FileUpload | | |
| Hop-by-hop abuse | | | | | | | HopByHopHeaders |
| JWT tampering | | | | | | JWT (stub) | |
| Path Traversal | | | | | | | |
| Command Injection | | | | | | | |
| Rate Limiting | | | | | | | |

**Fully implemented:** BaseSanitizer, TrimSanitizer, LengthSanitizer, HTMLSanitizer, CSRFSanitizer, FileUploadSanitizer, FormulaInjectionSanitizer, PDFInjectionSanitizer, ServerSideXSSSanitizer, HopByHopHeadersSanitizer, SchemaValidator, InputValidator (stub), and all utilities (patterns, encoders, detectors, logger).

---

## Threat Coverage Summary

| Layer | Threats Addressed |
|-------|------------------|
| **Input normalization** | Trim, length bounds, encoding |
| **XSS prevention** | Tag stripping, attribute sanitization, event handler removal, dangerous protocol blocking, HTML entity encoding |
| **Injection prevention** | SQL keywords, NoSQL operators, command separators, path traversal, XXE, Excel formula prefixes, PDF JavaScript actions |
| **Auth hardening** | CSRF token validation, JWT format checking, hop-by-hop header abuse, rate limiting, IDOR protection |
| **File safety** | MIME validation, magic bytes, size limits, filename sanitization, formula injection, PDF actions, server-side XSS in metadata |
| **Spam/bot** | URL count, spam keywords, repeated characters, caps lock ratio, disposable email detection |
| **Monitoring** | Attack detection, risk classification, security logging with beacon, sensitive field redaction |

The module implements defense-in-depth: even when individual sanitizers are stubbed, subsequent pipeline stages and schema validators provide additional layers before data reaches the backend. The SentinelPipeline always validates first, so validation errors are caught before any sanitization runs.
