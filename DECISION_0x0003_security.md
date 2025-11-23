# DECISION_0x0003 - Библиотека веб-санитайзеров

**Версия:** 0x0003  
**Дата:** November 23, 2025  
**Статус:** В РАЗРАБОТКЕ  
**Связано с:** DECISION_0x0002_security.md

---

1. [Обзор уязвимостей](#обзор-уязвимостей)
2. [Архитектура санитайзеров](#архитектура-санитайзеров)
3. [Категории санитайзеров](#категории-санитайзеров)
4. [Структура проекта](#структура-проекта)
5. [Preset конфигурации](#preset-конфигурации)
7. [Примеры использования](#примеры-использования)

---

## Обзор уязвимостей

Библиотека покрывает все основные веб-уязвимости из методологии HackTricks Web Vulnerabilities Methodology.

### Proxies (Прокси-уязвимости)
- **Hop-by-Hop Headers Abuse** - манипуляция HTTP заголовками между прокси
- **Cache Poisoning/Deception** - отравление кэша для компрометации других пользователей
- **HTTP Request Smuggling** - контрабанда HTTP запросов через несогласованность парсинга
- **H2C Smuggling** - атаки через HTTP/2 Cleartext
- **SSI/ESI** - Server/Edge Side Inclusion инъекции
- **XSLT Injection** - инъекции через XSLT трансформации

### User Input - Reflected Values (Отражаемые значения)
- **XSS** (Cross-Site Scripting) - reflected, stored, DOM-based
- **CSTI** (Client Side Template Injection) - инъекции в клиентские шаблоны
- **Command Injection** - выполнение системных команд на сервере
- **CRLF Injection** - манипуляция HTTP заголовками через `\r\n`
- **Dangling Markup** - незакрытые HTML теги для извлечения данных
- **Path Traversal** - обход директорий (`../../../etc/passwd`)
- **Open Redirect** - открытые редиректы для фишинга
- **Prototype Pollution** - загрязнение прототипов JavaScript объектов
- **SSRF** (Server Side Request Forgery) - принуждение сервера к запросам
- **SSTI** (Server Side Template Injection) - инъекции в серверные шаблоны
- **Reverse Tab Nabbing** - атаки через `window.opener`
- **XSSI** (Cross-Site Script Inclusion) - утечка данных через `<script>`
- **XS-Search** - поисковые атаки для извлечения информации

### Search Functionalities (Поисковые функции)
- **SQL Injection** - все типы: Union, Boolean, Time-based, Error-based
- **NoSQL Injection** - инъекции в MongoDB, CouchDB и т.д.
- **LDAP Injection** - манипуляция LDAP запросами
- **XPATH Injection** - инъекции в XML запросы
- **ReDoS** (Regular Expression Denial of Service) - атаки через регулярные выражения

### Forms & Communication (Формы и коммуникации)
- **CSRF** (Cross-Site Request Forgery) - подделка межсайтовых запросов
- **CSWSH** (Cross-Site WebSocket Hijacking) - угон WebSocket соединений
- **PostMessage Vulnerabilities** - уязвимости в межоконной коммуникации

### HTTP Headers (HTTP заголовки)
- **Clickjacking** - UI Redressing атаки через iframe
- **CSP Bypass** (Content Security Policy) - обход политики безопасности контента
- **Cookies Hacking** - манипуляция куками (HttpOnly, Secure, SameSite bypass)
- **CORS Misconfiguration** - неправильная настройка Cross-Origin Resource Sharing

### Bypasses (Обходы защиты)
- **2FA/OTP Bypass** - обход двухфакторной аутентификации
- **Payment Process Bypass** - обход процесса оплаты
- **Captcha Bypass** - обход капчи
- **Login Bypass** - обход авторизации
- **Race Condition** - состояние гонки в критических операциях
- **Rate Limit Bypass** - обход ограничения частоты запросов
- **Password Reset Bypass** - обход сброса пароля
- **Registration Vulnerabilities** - уязвимости в процессе регистрации

### Structured Data (Структурированные данные)
- **Deserialization** - небезопасная десериализация объектов
- **Email Header Injection** - инъекции в email заголовки
- **JWT Vulnerabilities** - все типы атак на JSON Web Tokens (алгоритм none, слабые ключи, и т.д.)
- **XXE** (XML External Entity) - атаки через внешние XML сущности

### Files (Файлы)
- **File Upload** - опасная загрузка файлов (shell upload, path traversal)
- **Formula Injection** - CSV/Excel инъекции (`=cmd|'/c calc'!A1`)
- **PDF Injection** - инъекции через PDF документы
- **Server Side XSS** - XSS через генерацию файлов на сервере

### External Identity (Внешняя аутентификация)
- **OAuth to Account Takeover** - захват аккаунта через OAuth
- **SAML Attacks** - атаки на SAML аутентификацию

### Other (Прочее)
- **Subdomain Takeover** - захват субдоменов
- **IDOR** (Insecure Direct Object Reference) - небезопасные прямые ссылки на объекты
- **Parameter Pollution** - загрязнение параметров
- **Unicode Normalization** - атаки через нормализацию Unicode

---

### Chain of Responsibility Pattern

```
Input → Validator → Sanitizer 1 → Sanitizer 2 → Sanitizer 3 → ... → Clean Output
                ↓
              Fail → Log & Throw Error
```

Каждый санитайзер в цепочке:
1. Проверяет, нужна ли обработка (`shouldSanitize()`)
2. Выполняет санитизацию (`sanitize()`)
3. Передает результат следующему санитайзеру
4. При ошибке - логирует и бросает исключение

### Типы Pipeline

- **SanitizerPipeline** - синхронная обработка для простых данных (строки, числа)
- **AsyncSanitizerPipeline** - асинхронная обработка для файлов, API запросов, БД операций

---

## Структура проекта

```
src/security/
├── sanitizers/              # Все санитайзеры
│   ├── base/               # Базовый класс
│   │   └── BaseSanitizer.js
│   │
│   ├── proxies/            # 6 файлов - защита от proxy атак
│   │   ├── HopByHopHeadersSanitizer.js
│   │   ├── CachePoisoningSanitizer.js
│   │   ├── RequestSmugglingProtector.js
│   │   ├── H2CSmugglingProtector.js
│   │   ├── SSIProtector.js
│   │   └── XSLTInjectionSanitizer.js
│   │
│   ├── reflected/          # 13 файлов - защита от reflected атак
│   │   ├── XSSSanitizer.js
│   │   ├── CSTISanitizer.js
│   │   ├── CommandInjectionSanitizer.js
│   │   ├── CRLFSanitizer.js
│   │   ├── DanglingMarkupSanitizer.js
│   │   ├── PathTraversalSanitizer.js
│   │   ├── OpenRedirectSanitizer.js
│   │   ├── PrototypePollutionSanitizer.js
│   │   ├── SSRFSanitizer.js
│   │   ├── SSTISanitizer.js
│   │   ├── ReverseTabNabbingSanitizer.js
│   │   ├── XSSISanitizer.js
│   │   └── XSSearchSanitizer.js
│   │
│   ├── search/             # 5 файлов - защита поисковых запросов
│   │   ├── SQLInjectionSanitizer.js
│   │   ├── NoSQLInjectionSanitizer.js
│   │   ├── LDAPInjectionSanitizer.js
│   │   ├── XPATHInjectionSanitizer.js
│   │   └── ReDoSSanitizer.js
│   │
│   ├── forms/              # 3 файла - защита форм
│   │   ├── CSRFProtector.js
│   │   ├── CSWSHProtector.js
│   │   └── PostMessageSanitizer.js
│   │
│   ├── headers/            # 4 файла - защита заголовков
│   │   ├── ClickjackingProtector.js
│   │   ├── CSPValidator.js
│   │   ├── CookieSanitizer.js
│   │   └── CORSValidator.js
│   │
│   ├── bypasses/           # 8 файлов - защита от обходов
│   │   ├── TwoFAProtector.js
│   │   ├── PaymentBypassProtector.js
│   │   ├── CaptchaValidator.js
│   │   ├── LoginBypassProtector.js
│   │   ├── RaceConditionProtector.js
│   │   ├── RateLimitEnforcer.js
│   │   ├── PasswordResetProtector.js
│   │   └── RegistrationValidator.js
│   │
│   ├── structured/         # 4 файла - защита структурированных данных
│   │   ├── DeserializationSanitizer.js
│   │   ├── EmailHeaderSanitizer.js
│   │   ├── JWTValidator.js
│   │   └── XXESanitizer.js
│   │
│   ├── files/              # 4 файла - защита файловых операций
│   │   ├── FileUploadSanitizer.js
│   │   ├── FormulaInjectionSanitizer.js
│   │   ├── PDFInjectionSanitizer.js
│   │   └── ServerSideXSSSanitizer.js
│   │
│   ├── identity/           # 2 файла - защита внешней аутентификации
│   │   ├── OAuthValidator.js
│   │   └── SAMLValidator.js
│   │
│   ├── other/              # 4 файла - прочие механизмы
│   │   ├── SubdomainTakeoverProtector.js
│   │   ├── IDORProtector.js
│   │   ├── ParameterPollutionSanitizer.js
│   │   └── UnicodeNormalizationSanitizer.js
│   │
│   └── shared/             # 5 файлов - общие санитайзеры
│       ├── TrimSanitizer.js
│       ├── LengthSanitizer.js
│       ├── EncodingSanitizer.js
│       ├── HTMLSanitizer.js
│       └── URLSanitizer.js
│
├── pipelines/              # Оркестраторы и preset'ы
│   ├── SanitizerPipeline.js
│   ├── AsyncSanitizerPipeline.js
│   └── presets/
│       ├── userInputPreset.js      # Для пользовательского ввода
│       ├── searchPreset.js         # Для поисковых запросов
│       ├── formPreset.js           # Для форм
│       ├── fileUploadPreset.js     # Для загрузки файлов
│       ├── apiPreset.js            # Для API endpoints
│       ├── authPreset.js           # Для аутентификации
│       └── adminPreset.js          # Для админ-панели
│
├── validators/             # Валидаторы и схемы
│   ├── InputValidator.js
│   ├── SchemaValidator.js
│   └── schemas/
│       ├── userInputSchema.js
│       ├── searchSchema.js
│       ├── fileUploadSchema.js
│       └── authSchema.js
│
├── utils/                  # Утилиты
│   ├── logger.js           # Логирование безопасности
│   ├── patterns.js         # Паттерны атак
│   ├── encoders.js         # Кодировщики
│   └── detectors.js        # Детекторы угроз
│
├── config/                 # Конфигурация
│   ├── sanitizerConfig.js
│   └── securityPolicies.js
│
└── index.js                # Main entry point

```

**Всего файлов:** 77  
**Всего санитайзеров:** 53

---

## Категории санитайзеров

### 1. Proxies (6 файлов)
Защита от атак через прокси и кэш. Эти санитайзеры работают на уровне HTTP инфраструктуры.

**Когда применять:** reverse proxy, CDN, load balancers

### 2. Reflected (13 файлов)
Защита от отражаемых уязвимостей в пользовательском вводе. Самая большая категория.

**Когда применять:** любой пользовательский ввод, который может быть отображен

### 3. Search (5 файлов)
Защита поисковых функций от различных типов инъекций в запросы к БД и API.

**Когда применять:** поисковые формы, фильтры, любые database queries

### 4. Forms (3 файла)
Защита форм и WebSocket коммуникаций от подделки запросов.

**Когда применять:** формы отправки данных, WebSocket connections, postMessage

### 5. Headers (4 файла)
Валидация и защита HTTP заголовков от различных атак.

**Когда применять:** middleware на уровне HTTP сервера

### 6. Bypasses (8 файлов)
Защита от обхода механизмов безопасности (rate limiting, auth, captcha).

**Когда применять:** критические операции (login, payment, registration)

### 7. Structured (4 файла)
Защита структурированных данных (JSON, XML, JWT, сериализованные объекты).

**Когда применять:** API endpoints, десериализация, работа с токенами

### 8. Files (4 файла)
Защита загрузки и обработки файлов от различных инъекций.

**Когда применять:** file upload, document generation, file processing

### 9. Identity (2 файла)
Защита внешней аутентификации (OAuth, SAML).

**Когда применять:** интеграция с внешними провайдерами аутентификации

### 10. Other (4 файла)
Прочие механизмы защиты (IDOR, subdomain takeover, parameter pollution).

**Когда применять:** специфические кейсы в зависимости от архитектуры

### 11. Shared (5 файлов)
Общие базовые санитайзеры, используемые во всех категориях.

**Когда применять:** везде как базовый уровень защиты

---

##Preset конфигурации

Готовые наборы санитайзеров для типичных сценариев использования.

### userInputPreset.js
**Назначение:** Обработка пользовательского ввода в формах

**Санитайзеры:**
1. TrimSanitizer - удаление пробелов
2. LengthSanitizer - ограничение длины
3. EncodingSanitizer - нормализация кодировки
4. XSSSanitizer - защита от XSS
5. SQLInjectionSanitizer - защита от SQL инъекций
6. CommandInjectionSanitizer - защита от command injection
7. PathTraversalSanitizer - защита от path traversal

**Использование:**
```javascript
import createUserInputPreset from './security/pipelines/presets/userInputPreset.js';

const pipeline = createUserInputPreset({ debug: true });
const cleanInput = pipeline.execute(userInput);
```

### searchPreset.js
**Назначение:** Обработка поисковых запросов

**Санитайзеры:**
1. TrimSanitizer
2. SQLInjectionSanitizer
3. NoSQLInjectionSanitizer
4. XPATHInjectionSanitizer
5. ReDoSSanitizer

**Использование:**
```javascript
import createSearchPreset from './security/pipelines/presets/searchPreset.js';

const pipeline = createSearchPreset();
const safeQuery = pipeline.execute(searchQuery);
```

### formPreset.js
**Назначение:** Обработка данных форм

**Санитайзеры:**
1. CSRFProtector
2. XSSSanitizer
3. HTMLSanitizer
4. EncodingSanitizer

**Использование:**
```javascript
import createFormPreset from './security/pipelines/presets/formPreset.js';

const pipeline = createFormPreset();
const safeFormData = pipeline.execute(formData);
```

### fileUploadPreset.js
**Назначение:** Обработка загружаемых файлов

**Санитайзеры:**
1. FileUploadSanitizer
2. PathTraversalSanitizer
3. FormulaInjectionSanitizer
4. ServerSideXSSSanitizer

**Использование:**
```javascript
import createFileUploadPreset from './security/pipelines/presets/fileUploadPreset.js';

const pipeline = createFileUploadPreset();
const safeFile = await pipeline.execute(uploadedFile);
```

### apiPreset.js
**Назначение:** Защита API endpoints

**Санитайзеры:**
1. RateLimitEnforcer
2. JWTValidator
3. CSRFProtector
4. SQLInjectionSanitizer
5. NoSQLInjectionSanitizer

**Использование:**
```javascript
import createApiPreset from './security/pipelines/presets/apiPreset.js';

const pipeline = createApiPreset({ rateLimit: { maxRequests: 100 } });
const safeApiData = await pipeline.execute(apiRequest);
```

### authPreset.js
**Назначение:** Защита процесса аутентификации

**Санитайзеры:**
1. TwoFAProtector
2. LoginBypassProtector
3. PasswordResetProtector
4. RaceConditionProtector
5. CookieSanitizer

**Использование:**
```javascript
import createAuthPreset from './security/pipelines/presets/authPreset.js';

const pipeline = createAuthPreset();
const safeAuthData = await pipeline.execute(authData);
```

### adminPreset.js
**Назначение:** Усиленная защита для админ-панели

**Санитайзеры:**
1. SQLInjectionSanitizer
2. XSSSanitizer
3. CSRFProtector
4. PathTraversalSanitizer
5. CommandInjectionSanitizer
6. IDORProtector

**Использование:**
```javascript
import createAdminPreset from './security/pipelines/presets/adminPreset.js';

const pipeline = createAdminPreset({ strict: true });
const safeAdminInput = await pipeline.execute(adminInput);
```

---

### Базовый пример

```javascript
// Импорт готового preset
import createUserInputPreset from './security/pipelines/presets/userInputPreset.js';

// Создание pipeline
const pipeline = createUserInputPreset();

// Очистка данных
const userInput = "<script>alert('XSS')</script>";
const cleanInput = pipeline.execute(userInput);
// Result: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
```

### Кастомный Pipeline

```javascript
import SanitizerPipeline from './security/pipelines/SanitizerPipeline.js';
import TrimSanitizer from './security/sanitizers/shared/TrimSanitizer.js';
import XSSSanitizer from './security/sanitizers/reflected/XSSSanitizer.js';
import SQLInjectionSanitizer from './security/sanitizers/search/SQLInjectionSanitizer.js';

// Создание кастомного pipeline
const customPipeline = new SanitizerPipeline();

customPipeline
  .add(new TrimSanitizer())
  .add(new XSSSanitizer({ strict: true }))
  .add(new SQLInjectionSanitizer());

// Использование
const dirtyInput = "  ' OR 1=1-- ";
const cleanInput = customPipeline.execute(dirtyInput);
```

### Async обработка файлов

```javascript
import createFileUploadPreset from './security/pipelines/presets/fileUploadPreset.js';

async function handleFileUpload(file) {
  const pipeline = createFileUploadPreset({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png']
  });
  
  try {
    const safeFile = await pipeline.execute(file);
    // Сохранение файла
    return { success: true, file: safeFile };
  } catch (error) {
    console.error('File sanitization failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Middleware для Express.js

```javascript
import createApiPreset from './security/pipelines/presets/apiPreset.js';

function sanitizerMiddleware(req, res, next) {
  const pipeline = createApiPreset();
  
  try {
    // Санитизация body
    if (req.body) {
      req.body = pipeline.execute(req.body);
    }
    
    // Санитизация query params
    if (req.query) {
      req.query = pipeline.execute(req.query);
    }
    
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input detected' });
  }
}

app.use(sanitizerMiddleware);
```

### Debug режим

```javascript
import createUserInputPreset from './security/pipelines/presets/userInputPreset.js';

const pipeline = createUserInputPreset({ 
  debug: true // Включает подробное логирование
});

const input = "<script>alert(1)</script>";
const output = pipeline.execute(input);

// Console output:
// [TrimSanitizer] INFO: Processing input
// [XSSSanitizer] WARN: XSS detected and sanitized
// [SQLInjectionSanitizer] INFO: No SQL injection detected
```

### Обработка ошибок

```javascript
import SanitizerPipeline from './security/pipelines/SanitizerPipeline.js';
import XSSSanitizer from './security/sanitizers/reflected/XSSSanitizer.js';

const pipeline = new SanitizerPipeline();
pipeline.add(new XSSSanitizer());

try {
  const result = pipeline.execute(maliciousInput);
  console.log('Clean output:', result);
} catch (error) {
  // Логирование атаки
  console.error('Security violation detected:', {
    sanitizer: error.sanitizer,
    input: error.input,
    timestamp: new Date()
  });
  
  // Возврат безопасного значения
  return '';
}
```

---

### Структура санитайзера

```javascript
import BaseSanitizer from '../base/BaseSanitizer.js';

class XSSSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.allowedTags = config.allowedTags || [];
  }
  
  sanitize(input) {
    // 1. Проверка типа
    if (typeof input !== 'string') {
      return input;
    }
    
    // 2. Логирование
    this.log(`Sanitizing input: ${input.substring(0, 50)}...`);
    
    // 3. Детекция атаки
    if (this.detectXSS(input)) {
      this.log('XSS detected!', 'warn');
    }
    
    // 4. Санитизация
    const clean = this.cleanXSS(input);
    
    // 5. Валидация результата
    if (this.detectXSS(clean)) {
      throw new Error('Sanitization failed - XSS still present');
    }
    
    return clean;
  }
  
  detectXSS(input) {
    // Детекция логика
  }
  
  cleanXSS(input) {
    // Очистка логика
  }
}

export default XSSSanitizer;
```

### Тестирование

```javascript
import XSSSanitizer from './XSSSanitizer.js';

describe('XSSSanitizer', () => {
  const sanitizer = new XSSSanitizer();
  
  test('should block script tags', () => {
    const input = '<script>alert(1)</script>';
    const output = sanitizer.sanitize(input);
    expect(output).not.toContain('<script');
  });
  
  test('should block event handlers', () => {
    const input = '<img src=x onerror=alert(1)>';
    const output = sanitizer.sanitize(input);
    expect(output).not.toContain('onerror');
  });
  
  test('should allow safe content', () => {
    const input = '<p>Hello World</p>';
    const output = sanitizer.sanitize(input);
    expect(output).toBe(input);
  });
  
  test('should handle edge cases', () => {
    expect(sanitizer.sanitize(null)).toBe(null);
    expect(sanitizer.sanitize(undefined)).toBe(undefined);
    expect(sanitizer.sanitize('')).toBe('');
  });
});
```

---

## Полезное 

### Документация

- **OWASP Top 10** - https://owasp.org/www-project-top-ten/
- **HackTricks** - https://book.hacktricks.xyz/
- **PortSwigger Web Security Academy** - https://portswigger.net/web-security
- **OWASP Cheat Sheet Series** - https://cheatsheetseries.owasp.org/

### Паттерны атак

- **XSS Filter Evasion Cheat Sheet** - https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html
- **SQL Injection Cheat Sheet** - https://portswigger.net/web-security/sql-injection/cheat-sheet
- **Command Injection** - https://owasp.org/www-community/attacks/Command_Injection
- **Path Traversal** - https://owasp.org/www-community/attacks/Path_Traversal

### Библиотеки для санитизации

- **DOMPurify** - для XSS (frontend)
- **validator.js** - для валидации строк
- **sanitize-html** - для HTML санитизации
- **express-validator** - для Express.js
- **joi** - для схема-валидации

---

### Установка

```bash
# Клонировать репозиторий
git clone <your-repo>

# Установить зависимости
npm install

# Запустить тесты
npm test
```

### Минимальный пример

```javascript
// 1. Импортируем preset
import createUserInputPreset from './src/security/pipelines/presets/userInputPreset.js';

// 2. Создаем pipeline
const pipeline = createUserInputPreset();

// 3. Очищаем данные
const userInput = req.body.comment;
const cleanComment = pipeline.execute(userInput);

// 4. Используем очищенные данные
await db.comments.create({ text: cleanComment });
```

### Интеграция с Express.js

```javascript
import express from 'express';
import createApiPreset from './src/security/pipelines/presets/apiPreset.js';

const app = express();
const sanitizer = createApiPreset();

// Глобальный middleware
app.use((req, res, next) => {
  try {
    if (req.body) req.body = sanitizer.execute(req.body);
    if (req.query) req.query = sanitizer.execute(req.query);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.post('/api/users', async (req, res) => {
  // req.body уже очищен
  const user = await createUser(req.body);
  res.json(user);
});
```

### Интеграция с React

```javascript
import { useState } from 'react';
import createUserInputPreset from './security/pipelines/presets/userInputPreset.js';

function CommentForm() {
  const [comment, setComment] = useState('');
  const sanitizer = createUserInputPreset();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Очистка на frontend
    const cleanComment = sanitizer.execute(comment);
    
    // Отправка на backend
    fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ text: cleanComment })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## Метрики и мониторинг

```javascript
{
  timestamp: '2025-11-23T10:30:00Z',
  sanitizer: 'XSSSanitizer',
  severity: 'high',
  blocked: true,
  input: '<script>alert(1)</script>',
  output: '&lt;script&gt;alert(1)&lt;/script&gt;',
  userId: 'user_123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
}
```

### Интеграция с мониторингом

```javascript
import SecurityLogger from './src/security/utils/logger.js';

// Настройка для отправки в Sentry/Datadog/etc
SecurityLogger.setHandler((logEntry) => {
  if (logEntry.severity === 'high' || logEntry.severity === 'critical') {
    // Отправить в систему мониторинга
    sentry.captureMessage('Security violation detected', {
      level: 'warning',
      extra: logEntry
    });
  }
});
```

---

### Структура тестов

```
tests/
├── unit/                   # Юнит-тесты для каждого санитайзера
│   ├── XSSSanitizer.test.js
│   ├── SQLInjectionSanitizer.test.js
│   └── ...
├── integration/            # Интеграционные тесты
│   ├── pipelines.test.js
│   └── presets.test.js
├── e2e/                    # End-to-end тесты
│   └── realworld.test.js
└── fixtures/               # Тестовые данные
    ├── xss-payloads.js
    ├── sql-payloads.js
    └── ...
```

### Тестовые данные (payloads)

Для каждого санитайзера нужно собрать коллекцию реальных атак:

- **XSS Payloads** - https://github.com/payloadbox/xss-payload-list
- **SQL Injection** - https://github.com/payloadbox/sql-injection-payload-list
- **Command Injection** - https://github.com/payloadbox/command-injection-payload-list
- **Path Traversal** - https://github.com/swisskyrepo/PayloadsAllTheThings

### Benchmark тесты

```javascript
import Benchmark from 'benchmark';
import XSSSanitizer from './XSSSanitizer.js';

const suite = new Benchmark.Suite();
const sanitizer = new XSSSanitizer();

suite
  .add('XSSSanitizer#sanitize', () => {
    sanitizer.sanitize('<script>alert(1)</script>');
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .run();
```

---

## Contributing

### Как добавить новый санитайзер

1. Создать файл в соответствующей категории
2. Наследоваться от `BaseSanitizer`
3. Реализовать метод `sanitize()`
4. Написать тесты с реальными payloads
5. Добавить документацию
6. Создать PR

### Пример 

```javascript
// src/security/sanitizers/reflected/MyNewSanitizer.js
import BaseSanitizer from '../base/BaseSanitizer.js';

/**
 * MyNewSanitizer - защита от XYZ атак
 * 
 * @example
 * const sanitizer = new MyNewSanitizer();
 * const clean = sanitizer.sanitize(dirtyInput);
 */
class MyNewSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    // Инициализация
  }
  
  sanitize(input) {
    if (!this.shouldSanitize(input)) {
      return input;
    }
    
    this.log(`Processing: ${input}`);
    
    // Логика санитизации
    const clean = this.clean(input);
    
    return clean;
  }
  
  clean(input) {
    // Реализация очистки
    return input;
  }
}

export default MyNewSanitizer;
```

---

### Практические лаборатории

- **PortSwigger Web Security Academy** - https://portswigger.net/web-security
- **OWASP WebGoat** - https://owasp.org/www-project-webgoat/
- **HackTheBox** - https://www.hackthebox.com/
- **TryHackMe** - https://tryhackme.com/

---

### Лицензия

MIT License 

---

## Итоговая статистика

**Всего санитайзеров:** 53  
**Категорий:** 11  
**Preset конфигураций:** 7  
**Utility файлов:** 4  
**Validator файлов:** 6  
**Pipeline файлов:** 2  

**Общее количество файлов:** 77

**Покрываемые уязвимости:**
- Proxies: 6 типов
- Reflected: 13 типов
- Search: 5 типов
- Forms: 3 типа
- Headers: 4 типа
- Bypasses: 8 типов
- Structured: 4 типа
- Files: 4 типа
- Identity: 2 типа
- Other: 4 типа

**Общее покрытие:** 53 типа веб-уязвимостей
