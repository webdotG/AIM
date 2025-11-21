# DECISION_0x0002.md - Система безопасности и санитизации данных

**Версия:** 0x0002  
**Дата:** November 21, 2025  
**Статус:** ПРИНЯТО  
**Связано с:** DECISION_0x0002_database.md, DECISION_0x0002_frontend.md  

---

. [1: Архитектура санитайзеров](#решение-1-архитектура-санитайзеров)  
. [2: Многослойное хеширование паролей](#решение-2-многослойное-хеширование-паролей)  
. [3: Очистка метаданных файлов](#решение-3-очистка-метаданных-файлов)  
. [Реализация санитайзеров](#реализация-санитайзеров)  
. [Примеры использования](#примеры-использования)  
. [Тестирование](#тестирование)  
  

---

## Варианты дырок  ;

1. **Инъекции в инпутах:**
   - XSS через пользовательский контент
   - SQL Injection через поисковые запросы

2. **Утечка метаданных:**
   - IP-адреса в EXIF фотографий
   - GPS координаты в изображениях
   - Метаданные устройства (модель камеры, ПО)

3. **Слабое хеширование паролей:**
   - Bcrypt => МАКСИМАЛЬНО НЕ КОШЕРНО СОЛИМ
   - Rainbow tables для популярных паролей
   - Доп слой защиты

### Идея
Создать **модульную систему санитизации**, где:
- Каждый санитайзер = отдельный модуль
- Можно добавлять новые санитайзеры без боли
- Разделение: frontend-санитайзеры и backend-санитайзеры
- Возможность комбинировать санитайзеры (pipeline)

---

## 1: Архитектура санитайзеров

### Принцип: Chain of Responsibility Pattern

```
Input → Sanitizer 1 → Sanitizer 2 → Sanitizer 3 → Clean Output
```

### Структура проекта

```
src/
├── security/
│   ├── sanitizers/
│   │   ├── base/
│   │   │   └── BaseSanitizer.js        # Базовый класс
│   │   ├── frontend/
│   │   │   ├── XSSSanitizer.js         # Очистка от XSS
│   │   │   ├── HTMLSanitizer.js        # Очистка HTML
│   │   │   ├── ImageMetaSanitizer.js   # Удаление EXIF
│   │   │   └── URLSanitizer.js         # Очистка URL
│   │   ├── backend/
│   │   │   ├── SQLSanitizer.js         # Защита от SQL Injection
│   │   │   └── PathSanitizer.js        # Очистка file paths
│   │   └── shared/
│   │       ├── TrimSanitizer.js        # Trim пробелов
│   │       ├── LengthSanitizer.js      # Ограничение длины
│   │       └── EncodingSanitizer.js    # UTF-8 нормализация
│   ├── pipelines/
│   │   ├── SanitizerPipeline.js        # Оркестратор санитайзеров
│   │   └── presets/
│   │       ├── entryContentPreset.js   # Для контента записей
│   │       ├── loginPreset.js          # Для login/password
│   │       └── imagePreset.js          # Для изображений
│   ├── hashing/
│   │   ├── PasswordHasher.js           # Многослойное хеширование
│   │   └── BackupCodeHasher.js         # Хеширование backup-кодов
│   └── validators/
│       ├── InputValidator.js           # Валидация перед санитизацией
│       └── schemas/
│           ├── entrySchema.js
│           └── authSchema.js
```

---

### Базовый класс санитайзера

```javascript
// security/sanitizers/base/BaseSanitizer.js

class BaseSanitizer {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
  }
  
  /**
   * Основной метод санитизации
   * @param {*} input - Входные данные
   * @returns {*} - Очищенные данные
   */
  sanitize(input) {
    throw new Error(`${this.name}: sanitize() must be implemented`);
  }
  
  /**
   * Проверка, нужна ли санитизация
   * @param {*} input
   * @returns {boolean}
   */
  shouldSanitize(input) {
    return input !== null && input !== undefined;
  }
  
  /**
   * Логирование (опционально)
   */
  log(message, level = 'info') {
    if (this.config.debug) {
      console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`);
    }
  }
}

export default BaseSanitizer;
```

---

### Pipeline для комбинирования санитайзеров

```javascript
// security/pipelines/SanitizerPipeline.js

class SanitizerPipeline {
  constructor() {
    this.sanitizers = [];
  }
  
  /**
   * Добавить санитайзер в цепочку
   */
  add(sanitizer) {
    if (!(sanitizer instanceof BaseSanitizer)) {
      throw new Error('Sanitizer must extend BaseSanitizer');
    }
    this.sanitizers.push(sanitizer);
    return this; // для chaining
  }
  
  /**
   * Выполнить всю цепочку санитизации
   */
  async execute(input) {
    let result = input;
    
    for (const sanitizer of this.sanitizers) {
      if (sanitizer.shouldSanitize(result)) {
        try {
          result = await sanitizer.sanitize(result);
        } catch (error) {
          console.error(`Sanitizer ${sanitizer.name} failed:`, error);
          throw error;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Очистить pipeline
   */
  clear() {
    this.sanitizers = [];
    return this;
  }
}

export default SanitizerPipeline;
```

---

## 2: Некошерное соление  

### Проблема обычного bcrypt:
```javascript
// Обычный подход
const hash = await bcrypt.hash(password, 12);
// Если БД утечет → атакующий может брутфорсить bcrypt
```

### Решение: Pepper + Bcrypt + Argon2

**Архитектура:**
```
Password 
  → Pepper (server secret)
  → Bcrypt (rounds=12)
  → Argon2id (memory-hard)
  → Final Hash
```

### Реализация

```javascript
// security/hashing/PasswordHasher.js

import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import crypto from 'crypto';

class PasswordHasher {
  constructor() {
    // Pepper — секретный ключ на сервере (НЕ в БД, в env)
    this.pepper = process.env.PASSWORD_PEPPER || this.generatePepper();
    
    // Настройки bcrypt
    this.bcryptRounds = 12;
    
    // Настройки Argon2
    this.argon2Config = {
      type: argon2.argon2id,
      memoryCost: 65536,      // 64 MB
      timeCost: 3,            // iterations
      parallelism: 4          // threads
    };
  }
  
  /**
   * Генерация pepper (один раз при инициализации)
   */
  generatePepper() {
    const pepper = crypto.randomBytes(32).toString('hex');
    console.warn(' - Ю - GENERATED NEW PEPPER:', pepper);
    console.warn(' - Ю - ADD TO .env: PASSWORD_PEPPER=' + pepper);
    return pepper;
  }
  
  /**
   * Слой 1: Pepper + HMAC-SHA256
   */
  applyPepper(password) {
    const hmac = crypto.createHmac('sha256', this.pepper);
    hmac.update(password);
    return hmac.digest('hex');
  }
  
  /**
   * Многослойное хеширование
   */
  async hash(password) {
    // 1. Применяем pepper
    const peppered = this.applyPepper(password);
    
    // 2. Bcrypt
    const bcrypted = await bcrypt.hash(peppered, this.bcryptRounds);
    
    // 3. Argon2id (самый стойкий) конеш можно стояк и покруче найти ;)
    const final = await argon2.hash(bcrypted, this.argon2Config);
    
    return final;
  }
  
  /**
   * Проверка пароля
   */
  async verify(password, hash) {
    try {
      // 1. Применяем pepper
      const peppered = this.applyPepper(password);
      
      // 2. Извлекаем bcrypt хеш из argon2
      // (argon2.verify автоматически декодирует)
      const argonValid = await argon2.verify(hash, peppered);
      
      if (!argonValid) {
        // Пробуем только bcrypt (для обратной совместимости)
        const bcryptValid = await bcrypt.compare(peppered, hash);
        return bcryptValid;
      }
      
      return true;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }
  
  /**
   * Проверка силы пароля НАДО ПРИДУМАТЬ КАК  "ЗАДРОЧИТЬ" ПОЛЬЗОВАТЕЛЯ ПЕРЕД ВХОДОМ 
   */
  checkStrength(password) {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecial
    ].filter(Boolean).length;
    
    return {
      score,
      isStrong: score >= 4,
      feedback: {
        length: password.length >= minLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecial
      }
    };
  }
}

export default new PasswordHasher();
```

### Использование

```javascript
// При регистрации
const hash = await PasswordHasher.hash('user_password_123');
// hash = "$argon2id$v=19$m=65536,t=3,p=4$..."

// При входе
const isValid = await PasswordHasher.verify('user_password_123', hash);
// isValid = true

// Проверка силы
const strength = PasswordHasher.checkStrength('weakpass');
// strength = { score: 2, isStrong: false, feedback: {...} }
```

---

### Backup-код хеширование - лайт вершен

```javascript
// security/hashing/BackupCodeHasher.js

import crypto from 'crypto';
import bcrypt from 'bcrypt';

class BackupCodeHasher {
  constructor() {
    this.bcryptRounds = 12;
  }
  
  /**
   * Генерация backup-кода
   * Формат: XXXX-XXXX-XXXX (12 символов, буквы + цифры)
   */
  generate() {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без O, 0, I, 1
    let code = '';
    
    for (let i = 0; i < 12; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      code += charset[randomIndex];
      
      // Добавляем дефис после каждых 4 символов
      if ((i + 1) % 4 === 0 && i < 11) {
        code += '-';
      }
    }
    
    return code; // "Господи спаси и сохрани"
  }
  
  /**
   * Хеширование backup-кода
   */
  async hash(code) {
    // Убираем дефисы перед хешированием
    const normalized = code.replace(/-/g, '');
    return bcrypt.hash(normalized, this.bcryptRounds);
  }
  
  /**
   * Проверка backup-кода
   */
  async verify(code, hash) {
    const normalized = code.replace(/-/g, '');
    return bcrypt.compare(normalized, hash);
  }
}

export default new BackupCodeHasher();
```

---

## 3: Очистка метаданных файлов

### ЕБАТЬ СКОЛЬКО ИНФЫ +=> надо чистить всё  до стирилизации (нацик я какой то но нет совсем)
Пользователь загружает фотографию → в EXIF есть:
- GPS координаты  
- IP-адрес камеры  
- Модель устройства
- Дата/время съемки
- Серийный номер камеры

### Решение: Санитайзер на фронтенде

```javascript
// security/sanitizers/frontend/ImageMetaSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';
import exifr from 'exifr'; // библиотека для работы с EXIF
import piexifjs from 'piexifjs'; // для удаления EXIF

class ImageMetaSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.removeAllMeta = config.removeAllMeta ?? true;
    this.allowedMeta = config.allowedMeta || []; // какие поля оставить
  }
  
  /**
   * Проверяем, есть ли EXIF
   */
  async hasMetadata(file) {
    try {
      const exif = await exifr.parse(file);
      return exif !== null && Object.keys(exif).length > 0;
    } catch {
      return false;
    }
  }
  
  /**
   * Удаление метаданных
   */
  async sanitize(file) {
    if (!(file instanceof File || file instanceof Blob)) {
      throw new Error('Input must be a File or Blob');
    }
    
    this.log(`Processing ${file.name}`);
    
    // Проверяем наличие метаданных
    const hasMeta = await this.hasMetadata(file);
    
    if (!hasMeta) {
      this.log('No metadata found, returning original');
      return file;
    }
    
    // Читаем изображение
    const dataUrl = await this.fileToDataURL(file);
    
    // Удаляем ВСЕ метаданные
    let cleanDataUrl;
    
    if (this.removeAllMeta) {
      cleanDataUrl = piexifjs.remove(dataUrl);
    } else {
      // Удаляем только опасные поля
      const exif = piexifjs.load(dataUrl);
      this.removeDangerousFields(exif);
      const exifBytes = piexifjs.dump(exif);
      cleanDataUrl = piexifjs.insert(exifBytes, dataUrl);
    }
    
    // Конвертируем обратно в File
    const cleanBlob = await this.dataURLToBlob(cleanDataUrl);
    const cleanFile = new File([cleanBlob], file.name, {
      type: file.type,
      lastModified: Date.now()
    });
    
    this.log(`Metadata removed from ${file.name}`);
    
    return cleanFile;
  }
  
  /**
   * Удаление опасных полей EXIF
   */
  removeDangerousFields(exif) {
    const dangerousFields = [
      'GPS',           // GPS координаты
      'MakerNote',     // Данные производителя
      'UserComment',   // Комментарии пользователя
      'ImageUniqueID', // Уникальный ID изображения
      'CameraOwnerName', // Имя владельца
      'BodySerialNumber', // Серийный номер
      'LensSerialNumber', // Серийный номер объектива
      'IPTCDigest',    // IPTC метаданные
      'XPComment',     // Windows комментарии
      'XPAuthor',      // Автор
      'Copyright'      // Копирайт
    ];
    
    // Удаляем из EXIF
    if (exif['0th']) {
      dangerousFields.forEach(field => {
        delete exif['0th'][piexifjs.ImageIFD[field]];
      });
    }
    
    // Удаляем GPS целиком
    delete exif['GPS'];
    
    // Удаляем Exif комментарии
    if (exif['Exif']) {
      delete exif['Exif'][piexifjs.ExifIFD.UserComment];
      delete exif['Exif'][piexifjs.ExifIFD.MakerNote];
    }
  }
  
  /**
   * File → Data URL
   */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Data URL → Blob
   */
  async dataURLToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }
  
  /**
   * Получить информацию об удаленных метаданных (для логов)
   */
  async getRemovedMetadata(file) {
    try {
      const exif = await exifr.parse(file, {
        gps: true,
        interop: true,
        ifd0: true,
        ifd1: true,
        exif: true
      });
      
      const removed = {
        gps: exif?.GPS || null,
        camera: exif?.Make && exif?.Model 
          ? `${exif.Make} ${exif.Model}` 
          : null,
        software: exif?.Software || null,
        dateTime: exif?.DateTime || null,
        serialNumber: exif?.BodySerialNumber || null
      };
      
      return Object.fromEntries(
        Object.entries(removed).filter(([_, v]) => v !== null)
      );
    } catch {
      return {};
    }
  }
}

export default ImageMetaSanitizer;
```

---

## КАК ЭТО ДОЛЖНО РАБОТАТЬ ;

### Frontend санитайзеры

#### 1. XSS Sanitizer
```javascript
// security/sanitizers/frontend/XSSSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';
import DOMPurify from 'dompurify';

class XSSSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.allowHtml = config.allowHtml ?? false;
  }
  
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    if (this.allowHtml) {
      // Разрешаем базовый HTML, но очищаем опасное
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href']
      });
    }
    
    // Удаляем весь HTML
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
}

export default XSSSanitizer;
```

---

#### 2. URL Sanitizer
```javascript
// security/sanitizers/frontend/URLSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';

class URLSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.allowedProtocols = config.allowedProtocols || ['http', 'https'];
  }
  
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    try {
      const url = new URL(input);
      
      // Проверяем протокол
      if (!this.allowedProtocols.includes(url.protocol.replace(':', ''))) {
        this.log(`Blocked protocol: ${url.protocol}`, 'warn');
        return '';
      }
      
      // Удаляем tracking параметры
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 
                             'fbclid', 'gclid', 'mc_eid'];
      trackingParams.forEach(param => url.searchParams.delete(param));
      
      return url.toString();
    } catch {
      // Невалидный URL
      return '';
    }
  }
}

export default URLSanitizer;
```

---

### Backend санитайзеры

#### 1. SQL Sanitizer
```javascript
// security/sanitizers/backend/SQLSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';

class SQLSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(;|--|\/\*|\*\/|xp_|sp_)/gi,
      /('|"|`)/g,
      /(UNION|JOIN|WHERE|AND|OR|HAVING|ORDER\s+BY)/gi
    ];
  }
  
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    let sanitized = input;
    
    // Проверяем на SQL инъекции
    for (const pattern of this.sqlPatterns) {
      if (pattern.test(sanitized)) {
        this.log(`SQL injection attempt detected: ${sanitized}`, 'error');
        // Экранируем опасные символы
        sanitized = sanitized.replace(pattern, '');
      }
    }
    
    return sanitized;
  }
}

export default SQLSanitizer;
```

---

#### 2. Path Sanitizer
```javascript
// security/sanitizers/backend/PathSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';
import path from 'path';

class PathSanitizer extends BaseSanitizer {
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    // Удаляем path traversal попытки
    let sanitized = input.replace(/\.\./g, '');
    sanitized = sanitized.replace(/[/\\]+/g, path.sep);
    
    // Нормализуем path
    sanitized = path.normalize(sanitized);
    
    // Удаляем абсолютные пути
    if (path.isAbsolute(sanitized)) {
      this.log('Absolute path detected, converting to relative', 'warn');
      sanitized = path.relative('/', sanitized);
    }
    
    return sanitized;
  }
}

export default PathSanitizer;
```

---

### Shared санитайзеры

#### 1. Trim Sanitizer
```javascript
// security/sanitizers/shared/TrimSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';

class TrimSanitizer extends BaseSanitizer {
  sanitize(input) {
    if (typeof input === 'string') {
      return input.trim();
    }
    
    if (typeof input === 'object' && input !== null) {
      const result = Array.isArray(input) ? [] : {};
      
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.sanitize(value);
      }
      
      return result;
    }
    
    return input;
  }
}

export default TrimSanitizer;
```

---

#### 2. Length Sanitizer
```javascript
// security/sanitizers/shared/LengthSanitizer.js

import BaseSanitizer from '../base/BaseSanitizer.js';

class LengthSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    this.maxLength = config.maxLength || 10000;
    this.truncate = config.truncate ?? true;
  }
  
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    if (input.length > this.maxLength) {
      if (this.truncate) {
        this.log(`Input truncated from ${input.length} to ${this.maxLength}`, 'warn');
        return input.substring(0, this.maxLength);
      } else {
        throw new Error(`Input exceeds maximum length of ${this.maxLength}`);
      }
    }
    
    return input;
  }
}

export default LengthSanitizer;
```

---

## ПРАКТИЧЕСКОЕ ПРИМЕНЕНИЕ

### Preset 1: Санитизация контента записи

```javascript
// security/pipelines/presets/entryContentPreset.js

import SanitizerPipeline from '../SanitizerPipeline.js';
import TrimSanitizer from '../../sanitizers/shared/TrimSanitizer.js';
import LengthSanitizer from '../../sanitizers/shared/LengthSanitizer.js';
import XSSSanitizer from '../../sanitizers/frontend/XSSSanitizer.js';

export function createEntryContentPipeline() {
  const pipeline = new SanitizerPipeline();
  
  pipeline
    .add(new TrimSanitizer())
    .add(new LengthSanitizer({ maxLength: 50000 }))
    .add(new XSSSanitizer({ allowHtml: false }));
  
  return pipeline;
}

// Использование
const pipeline = createEntryContentPipeline();
const cleanContent = await pipeline.execute(userInput);
```

---

### Preset 2: Санитизация login/password

```javascript
// security/pipelines/presets/loginPreset.js

import SanitizerPipeline from '../SanitizerPipeline.js';
import TrimSanitizer from '../../sanitizers/shared/TrimSanitizer.js';
import LengthSanitizer from '../../sanitizers/shared/LengthSanitizer.js';
import SQLSanitizer from '../../sanitizers/backend/SQLSanitizer.js';

export function createLoginPipeline() {
  const pipeline = new SanitizerPipeline();
  
  pipeline
    .add(new TrimSanitizer())
    .add(new LengthSanitizer({ maxLength: 50, truncate: false }))
    .add(new SQLSanitizer());
  
  return pipeline;
}

// Использование
const pipeline = createLoginPipeline();
const cleanLogin = await pipeline.execute(req.body.login);
```

---

### Preset 3: Очистка изображений

```javascript
// security/pipelines/presets/imagePreset.js

import SanitizerPipeline from '../SanitizerPipeline.js';
import ImageMetaSanitizer from '../../sanitizers/frontend/ImageMetaSanitizer.js';

export function createImagePipeline() {
  const pipeline = new SanitizerPipeline();
  
  pipeline.add(new ImageMetaSanitizer({ 
    removeAllMeta: true,
    debug: true 
  }));
  
  return pipeline;
}

// Использование (React)
async function handleImageUpload(file) {
  const pipeline = createImagePipeline();
  const cleanFile = await pipeline.execute(file);
  
  // Теперь cleanFile не содержит метаданных
  const formData = new FormData();
  formData.append('image', cleanFile);
  
  await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
}
```

---

### В React  

```javascript
// ui/components/EntryForm.jsx

import React, { useState } from 'react';
import { createEntryContentPipeline } from '@/security/pipelines/presets/entryContentPreset';
import { createImagePipeline } from '@/security/pipelines/presets/imagePreset';

export default function EntryForm() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Санитизация текста
      const contentPipeline = createEntryContentPipeline();
      const cleanContent = await contentPipeline.execute(content);
      
      // 2. Санитизация изображения (если есть)
      let cleanImage = null;
      if (image) {
        const imagePipeline = createImagePipeline();
        cleanImage = await imagePipeline.execute(image);
      }
      
      // 3. Отправка на сервер
      const formData = new FormData();
      formData.append('content', cleanContent);
      if (cleanImage) {
        formData.append('image', cleanImage);
      }
      
      await fetch('/api/entries', {
        method: 'POST',
        body: formData
      });
      
      alert('Запись создана!');
    } catch (error) {
      console.error('Sanitization failed:', error);
      alert('Ошибка при обработке данных');
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Опишите свой сон..."
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      
      <button type="submit">Создать запись</button>
    </form>
  );
}
```

---

## Тестирование

### Unit тесты для санитайзеров

```javascript
// __tests__/security/XSSSanitizer.test.js

import XSSSanitizer from '@/security/sanitizers/frontend/XSSSanitizer';

describe('XSSSanitizer', () => {
  let sanitizer;
  
  beforeEach(() => {
    sanitizer = new XSSSanitizer({ allowHtml: false });
  });
  
  test('should remove script tags', () => {
    const input = '<script>alert("XSS")</script>Hello';
    const output = sanitizer.sanitize(input);
    expect(output).toBe('Hello');
    expect(output).not.toContain('<script>');
  });
  
  test('should remove event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const output = sanitizer.sanitize(input);
    expect(output).not.toContain('onerror');
  });
  
  test('should allow plain text', () => {
    const input = 'Обычный текст без HTML';
    const output = sanitizer.sanitize(input);
    expect(output).toBe(input);
  });
  
  test('should handle null/undefined', () => {
    expect(sanitizer.sanitize(null)).toBe(null);
    expect(sanitizer.sanitize(undefined)).toBe(undefined);
  });
  
  test('should allow basic HTML when configured', () => {
    const sanitizerWithHtml = new XSSSanitizer({ allowHtml: true });
    const input = '<b>Bold</b> and <script>bad</script>';
    const output = sanitizerWithHtml.sanitize(input);
    
    expect(output).toContain('<b>Bold</b>');
    expect(output).not.toContain('<script>');
  });
});
```

---

### Integration тесты для pipeline

```javascript
// __tests__/security/EntryContentPipeline.test.js

import { createEntryContentPipeline } from '@/security/pipelines/presets/entryContentPreset';

describe('Entry Content Pipeline', () => {
  let pipeline;
  
  beforeEach(() => {
    pipeline = createEntryContentPipeline();
  });
  
  test('should sanitize complete entry content', async () => {
    const input = '  <script>alert("XSS")</script>Мой сон о полете  ';
    const output = await pipeline.execute(input);
    
    expect(output).toBe('Мой сон о полете'); // trimmed + XSS removed
    expect(output).not.toContain('<script>');
  });
  
  test('should truncate long content', async () => {
    const input = 'A'.repeat(60000);
    const output = await pipeline.execute(input);
    
    expect(output.length).toBe(50000);
  });
  
  test('should handle empty strings', async () => {
    const output = await pipeline.execute('   ');
    expect(output).toBe('');
  });
});
```

---

### E2E тест для загрузки изображения

```javascript
// __tests__/e2e/imageUpload.test.js

import { createImagePipeline } from '@/security/pipelines/presets/imagePreset';
import fs from 'fs';

describe('Image Upload with Metadata Removal', () => {
  test('should remove GPS from image', async () => {
    // Загружаем тестовое изображение с GPS
    const testImage = fs.readFileSync('./test/fixtures/image_with_gps.jpg');
    const file = new File([testImage], 'test.jpg', { type: 'image/jpeg' });
    
    const pipeline = createImagePipeline();
    const sanitizer = pipeline.sanitizers[0];
    
    // Проверяем наличие GPS до санитизации
    const metaBefore = await sanitizer.getRemovedMetadata(file);
    expect(metaBefore.gps).toBeDefined();
    
    // Санитизируем
    const cleanFile = await pipeline.execute(file);
    
    // Проверяем отсутствие GPS после
    const metaAfter = await sanitizer.getRemovedMetadata(cleanFile);
    expect(metaAfter.gps).toBeUndefined();
  });
});
```

---

## Схема БД ==== ОБНОВЛЕНИЕ ==== 21 ноября

### Добавление таблицы для логов безопасности

```sql
security_logs
  id                SERIAL PRIMARY KEY
  user_id           INT REFERENCES users(id) ON DELETE SET NULL
  event_type        VARCHAR(50) NOT NULL  -- 'sanitization', 'failed_login', 'suspicious_activity'
  severity          VARCHAR(20) NOT NULL  -- 'low', 'medium', 'high', 'critical'
  description       TEXT
  metadata          JSONB                 -- дополнительные данные
  ip_hash           VARCHAR(64)           -- хеш IP (не сам IP!)
  user_agent_hash   VARCHAR(64)           -- хеш User-Agent
  created_at        TIMESTAMP DEFAULT NOW()
```

**Индексы:**
```sql
CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_severity ON security_logs(severity);
CREATE INDEX idx_security_logs_created ON security_logs(created_at DESC);
```

**Важно:** Храним **хеши** IP/User-Agent, не сами значения!

```javascript
// Логирование попытки XSS
const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
const uaHash = crypto.createHash('sha256').update(req.headers['user-agent']).digest('hex');

await db.query(`
  INSERT INTO security_logs (user_id, event_type, severity, description, ip_hash, user_agent_hash)
  VALUES ($1, 'xss_attempt', 'high', $2, $3, $4)
`, [userId, 'XSS detected in entry content', ipHash, uaHash]);
```

---

## Конфигурация (.env)

```bash
# .env.example

# Security
PASSWORD_PEPPER=GENERATE_RANDOM_64_CHARS_HERE
BCRYPT_ROUNDS=12
ARGON2_MEMORY=65536
ARGON2_TIME=3
ARGON2_PARALLELISM=4

# JWT
JWT_SECRET=GENERATE_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=24h

# Sanitization
MAX_CONTENT_LENGTH=50000
MAX_IMAGE_SIZE=10485760  # 10 MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Rate limiting
RATE_LIMIT_WINDOW=900000  # 15 min
RATE_LIMIT_MAX=100

# Security logs
SECURITY_LOGS_RETENTION_DAYS=90
```

---

## Middleware для Express

### Санитизация всех входящих данных

```javascript
// backend/middleware/sanitize.middleware.js

import { createLoginPipeline } from '../security/pipelines/presets/loginPreset.js';
import { createEntryContentPipeline } from '../security/pipelines/presets/entryContentPreset.js';

export async function sanitizeInputs(req, res, next) {
  try {
    // Санитизация body
    if (req.body) {
      req.body = await sanitizeObject(req.body, req.path);
    }
    
    // Санитизация query params
    if (req.query) {
      req.query = await sanitizeObject(req.query, req.path);
    }
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
}

async function sanitizeObject(obj, path) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Выбираем pipeline в зависимости от пути
      let pipeline;
      
      if (path.includes('/auth')) {
        pipeline = createLoginPipeline();
      } else if (path.includes('/entries')) {
        pipeline = createEntryContentPipeline();
      } else {
        // Дефолтная санитизация
        pipeline = createDefaultPipeline();
      }
      
      result[key] = await pipeline.execute(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await sanitizeObject(value, path);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}
```

---

### Rate limiting с логированием

```javascript
// backend/middleware/rateLimiter.middleware.js

import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import db from '../db/index.js';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  
  // Лимит по user_id, не по IP
  keyGenerator: (req) => {
    return req.user?.id?.toString() || 'anonymous';
  },
  
  // Логирование превышения лимита
  handler: async (req, res) => {
    const ipHash = crypto.createHash('sha256').update(req.ip).digest('hex');
    
    await db.query(`
      INSERT INTO security_logs (user_id, event_type, severity, description, ip_hash)
      VALUES ($1, 'rate_limit_exceeded', 'medium', 'Too many requests', $2)
    `, [req.user?.id || null, ipHash]);
    
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
});
```

---

## Checklist внедрения

### Frontend
- [ ] Установить зависимости: `dompurify`, `exifr`, `piexifjs`
- [ ] Создать базовый класс `BaseSanitizer`
- [ ] Реализовать `XSSSanitizer`, `ImageMetaSanitizer`, `URLSanitizer`
- [ ] Реализовать `SanitizerPipeline`
- [ ] Создать presets для разных типов данных
- [ ] Добавить санитизацию в формы (EntryForm, AuthForm)
- [ ] Написать unit тесты
- [ ] Добавить E2E тесты для загрузки изображений

### Backend
- [ ] Установить зависимости: `bcrypt`, `argon2`, `express-rate-limit`
- [ ] Реализовать `PasswordHasher` (Pepper + Bcrypt + Argon2)
- [ ] Реализовать `BackupCodeHasher`
- [ ] Создать `SQLSanitizer`, `PathSanitizer`, `NoSQLSanitizer`
- [ ] Добавить middleware `sanitizeInputs`
- [ ] Добавить middleware `rateLimiter`
- [ ] Создать таблицу `security_logs`
- [ ] Настроить `.env` (PASSWORD_PEPPER, JWT_SECRET)
- [ ] Написать integration тесты
- [ ] Настроить мониторинг security_logs

### DevOps
- [ ] Сгенерировать `PASSWORD_PEPPER` (64 символа, random)
- [ ] Сгенерировать `JWT_SECRET` (64 символа, random)
- [ ] Настроить ротацию security_logs (удаление старых через 90 дней)
- [ ] Настроить алерты на критичные события (security_logs.severity = 'critical')
- [ ] Backup pepper/secret в защищенном месте (не в Git!)

---

## Мониторинг безопасности

### Запрос: Топ атак за последние 24 часа

```sql
SELECT 
  event_type,
  COUNT(*) as count,
  MAX(severity) as max_severity
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC
LIMIT 10;
```

---

### Запрос: Подозрительные пользователи

```sql
-- Пользователи с более 10 попытками XSS
SELECT 
  user_id,
  COUNT(*) as xss_attempts,
  MAX(created_at) as last_attempt
FROM security_logs
WHERE event_type = 'xss_attempt'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id
HAVING COUNT(*) > 10
ORDER BY xss_attempts DESC;
```

---

### Дашборд метрик (для Grafana/Datadog)

```javascript
// backend/metrics/securityMetrics.js

export async function getSecurityMetrics() {
  const [
    totalLogs,
    criticalEvents,
    rateLimitHits,
    xssAttempts
  ] = await Promise.all([
    db.query('SELECT COUNT(*) FROM security_logs WHERE created_at >= NOW() - INTERVAL \'24 hours\''),
    db.query('SELECT COUNT(*) FROM security_logs WHERE severity = \'critical\' AND created_at >= NOW() - INTERVAL \'24 hours\''),
    db.query('SELECT COUNT(*) FROM security_logs WHERE event_type = \'rate_limit_exceeded\' AND created_at >= NOW() - INTERVAL \'24 hours\''),
    db.query('SELECT COUNT(*) FROM security_logs WHERE event_type = \'xss_attempt\' AND created_at >= NOW() - INTERVAL \'24 hours\'')
  ]);
  
  return {
    total_security_events: totalLogs.rows[0].count,
    critical_events: criticalEvents.rows[0].count,
    rate_limit_hits: rateLimitHits.rows[0].count,
    xss_attempts: xssAttempts.rows[0].count
  };
}
```
---

*Совет постановил*