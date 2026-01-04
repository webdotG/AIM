# Auth Module API Documentation

Base path: `/api/v1/auth`

## POST /register

Регистрация нового пользователя.

**Middleware:** hCaptcha verification

**Request Body:**
```json
{
  "login": "string",
  "password": "string",
  "hcaptchaToken": "string"
}
```

**Validation:**
- `login`: 3-50 символов, только буквы, цифры и подчеркивания
- `password`: 8-128 символов
- Проверка уникальности login
- Проверка силы пароля (uppercase, lowercase, numbers, не common passwords, не sequential patterns)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "login": "username"
    },
    "token": "jwt_token",
    "backupCode": "generated_backup_code",
    "message": "SAVE THIS BACKUP CODE! You will need it to recover your password."
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "error": "Validation error",
  "details": []
}
```

400 - Registration Failed:
```json
{
  "success": false,
  "error": "User already exists / Registration failed"
}
```

---

## POST /login

Вход в систему.

**Middleware:** hCaptcha verification

**Request Body:**
```json
{
  "login": "string",
  "password": "string",
  "hcaptchaToken": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "login": "username"
    },
    "token": "jwt_token"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "error": "Validation error",
  "details": []
}
```

401 - Invalid Credentials:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## GET /verify

Проверка валидности JWT токена.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "login": "username"
    }
  }
}
```

**Error Responses:**

401 - No Token:
```json
{
  "success": false,
  "error": "No token provided"
}
```

401 - Invalid Token:
```json
{
  "success": false,
  "error": "Invalid token"
}
```

---

## POST /recover

Восстановление пароля через backup code.

**Middleware:** hCaptcha verification

**Request Body:**
```json
{
  "backup_code": "string",
  "new_password": "string",
  "hcaptchaToken": "string"
}
```

**Validation:**
- `new_password`: 8-128 символов
- Проверка силы пароля

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "backup_code": "new_generated_backup_code",
    "message": "Password updated successfully"
  }
}
```

**Error Responses:**

400 - Validation Error:
```json
{
  "success": false,
  "error": "Validation error",
  "details": []
}
```

400 - Recovery Failed:
```json
{
  "success": false,
  "error": "Invalid backup code / Failed to recover password"
}
```

---

## POST /check-password-strength

Проверка силы пароля.

**Request Body:**
```json
{
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isStrong": true,
    "score": 85,
    "reasons": [],
    "suggestions": []
  }
}
```

**Error Responses:**

400 - Missing Password:
```json
{
  "success": false,
  "error": "Password is required"
}
```

500 - Server Error:
```json
{
  "success": false,
  "error": "Failed to check password strength"
}
```

---

## GET /generate-password

Генерация рекомендации сильного пароля.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "password": "Generated-Strong-Password123"
  }
}
```

**Error Response:**

500 - Server Error:
```json
{
  "success": false,
  "error": "Failed to generate password"
}
```

---

## Общие замечания

- Все пароли хешируются с использованием bcrypt + pepper
- JWT токены содержат `userId` и `login`
- Backup code генерируется при регистрации и при смене пароля
- Timing attack protection реализован для login endpoint
- Rate limiting применяется ко всем endpoint'ам