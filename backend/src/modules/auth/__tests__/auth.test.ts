import request from 'supertest';
import app from '../../../index';
import { pool } from '../../../db/pool';

describe('Auth Module - Complete Test Suite', () => {

  beforeEach(async () => {
    await pool.query("DELETE FROM users WHERE login LIKE 'test_%' OR login LIKE 'testuser%' OR login LIKE 'test-%'");
  });


  describe('POST /api/v1/auth/register - Success Cases', () => {
    it('should register a new user with strong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_user_valid',
          password: 'Purple-Monkey-87-Staple!'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('backupCode');
      expect(response.body.data.user.login).toBe('test_user_valid');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.message).toContain('SAVE THIS BACKUP CODE');
      
      // JWT токен формат
      expect(response.body.data.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      
      // Backup code - 32 символа HEX uppercase
      expect(response.body.data.backupCode).toHaveLength(32);
      expect(response.body.data.backupCode).toMatch(/^[A-F0-9]{32}$/);
    });

    it('should accept password with minimum 12 characters and all requirements', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_min_pass',
          password: 'Abc123!@#Xyz' // Ровно 12 символов
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept very strong passphrase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_passphrase',
          password: 'Battery-Staple-Horse-Giraffe-38%'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept password with special characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_special',
          password: 'MyP@ssw0rd!2024$'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    // it('should accept maximum length password (128 chars)', async () => {
    //   const maxPassword = 'Aa1!' + 'b'.repeat(60) + 'C'.repeat(60); // 128 символов, но без повторений
    //   const response = await request(app)
    //     .post('/api/v1/auth/register')
    //     .send({
    //       login: 'test_max_pass',
    //       password: maxPassword
    //     })
    //     .expect(201);

    //   expect(response.body.success).toBe(true);
    // });
  });

  describe('POST /api/v1/auth/register - Validation Errors', () => {
    it('should reject missing login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'ValidPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_no_password'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject login shorter than 3 characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'ab',
          password: 'ValidPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should reject login longer than 50 characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 't'.repeat(51),
          password: 'ValidPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with invalid characters', async () => {
      const invalidLogins = [
        'test user',      // пробел
        'test@user',      // @
        'test.user',      // точка
        'test-user',      // дефис
        'test!user',      // восклицательный знак
      ];

      for (const login of invalidLogins) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            login,
            password: 'ValidPassword123!'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    it('should reject duplicate login', async () => {
      // Первая регистрация
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_duplicate',
          password: 'ValidPassword123!'
        })
        .expect(201);

      // Попытка дублирования
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_duplicate',
          password: 'DifferentPass456!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Login already taken');
    });
  });

  describe('POST /api/v1/auth/register - Password Strength Requirements', () => {
    // it('should reject password shorter than 12 characters', async () => {
    //   const response = await request(app)
    //     .post('/api/v1/auth/register')
    //     .send({
    //       login: 'test_short_pass',
    //       password: 'Short1!'
    //     })
    //     .expect(400);
    //       expect(response.body.success).toBe(false);
    //       expect(response.body.error).toBeDefined();
    // });

    it('should reject password without uppercase letter', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_no_upper',
          password: 'alllowercase123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('uppercase letter');
    });

    it('should reject password without lowercase letter', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_no_lower',
          password: 'ALLUPPERCASE123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('lowercase letter');
    });

    it('should reject password without numbers', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_no_numbers',
          password: 'NoNumbersHere!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('number');
    });

    it('should reject password with spaces', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_spaces',
          password: 'Valid Pass 123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot contain spaces');
    });

    it('should reject common passwords', async () => {
      const commonPasswords = [
        'Password123!',
        'Admin123456!',
        'Qwerty12345!',
        'Welcome123!',
      ];

      for (const password of commonPasswords) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            login: `test_common_${Math.random()}`,
            password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    it('should reject password with sequential patterns', async () => {
      const sequentialPasswords = [
        'Abc123456789!',  // последовательные цифры
        'Abcdefgh123!',   // последовательные буквы
      ];

      for (const password of sequentialPasswords) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            login: `test_seq_${Math.random()}`,
            password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    it('should reject password with repeating characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_repeat',
          password: 'Aaaaa1111111!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('repeating characters');
    });

    it('should reject password longer than 128 characters', async () => {
      const tooLongPassword = 'Aa1!' + 'x'.repeat(130);
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_too_long',
          password: tooLongPassword
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login - Success Cases', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_login_user',
          password: 'ValidPassword123!'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'test_login_user',
          password: 'ValidPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.login).toBe('test_login_user');
    });

    it('should enforce timing attack protection', async () => {
      const start = Date.now();
      
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'test_login_user',
          password: 'ValidPassword123!'
        });
      
      const elapsed = Date.now() - start;
      
      // Должна быть минимальная задержка ~500ms
      expect(elapsed).toBeGreaterThanOrEqual(450);
    });
  });

  describe('POST /api/v1/auth/login - Error Cases', () => {
    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'nonexistent_user',
          password: 'ValidPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with wrong password', async () => {
      // Создаем пользователя
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_wrong_pass',
          password: 'CorrectPassword123!'
        });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'test_wrong_pass',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should enforce same timing for wrong user and wrong password', async () => {
      // Создаем пользователя
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_timing',
          password: 'ValidPassword123!'
        });

      // Неверный пользователь
      const start1 = Date.now();
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'nonexistent',
          password: 'SomePassword123!'
        });
      const time1 = Date.now() - start1;

      // Неверный пароль
      const start2 = Date.now();
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'test_timing',
          password: 'WrongPassword123!'
        });
      const time2 = Date.now() - start2;

      // Разница во времени должна быть небольшой
      expect(Math.abs(time1 - time2)).toBeLessThan(200);
    });
  });

  describe('GET /api/v1/auth/verify - Token Verification', () => {
    let validToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_verify_user',
          password: 'ValidPassword123!'
        });
      
      validToken = response.body.data.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('login');
      expect(response.body.data.user.login).toBe('test_verify_user');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Authorization', 'NotBearer token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/recover - Password Recovery', () => {
    let backupCode: string;
    let userId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_recover_user',
          password: 'OldPassword123!'
        });
      
      backupCode = response.body.data.backupCode;
      userId = response.body.data.user.id;
    });

    it('should recover password with valid backup code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/recover')
        .send({
          backup_code: backupCode,
          new_password: 'NewPassword456!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('backup_code');
      expect(response.body.data.message).toContain('Password updated successfully');
      expect(response.body.data.backup_code).not.toBe(backupCode);
    });

    it('should allow login with new password after recovery', async () => {
      // Восстанавливаем пароль
      await request(app)
        .post('/api/v1/auth/recover')
        .send({
          backup_code: backupCode,
          new_password: 'NewPassword456!'
        });

      // Пробуем войти с новым паролем
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          login: 'test_recover_user',
          password: 'NewPassword456!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject recovery with invalid backup code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/recover')
        .send({
          backup_code: 'INVALID1234567890ABCDEF1234567890',
          new_password: 'NewPassword456!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid backup code');
    });

    it('should reject recovery with weak new password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/recover')
        .send({
          backup_code: backupCode,
          new_password: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('too weak');
    });
  });

  describe('POST /api/v1/auth/check-password-strength', () => {
    it('should return strength analysis for strong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/check-password-strength')
        .send({
          password: 'Purple-Monkey-87-Staple!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isStrong).toBe(true);
      expect(response.body.data.score).toBeGreaterThanOrEqual(70);
      expect(response.body.data.reasons).toEqual([]);
    });

    it('should return detailed reasons for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/check-password-strength')
        .send({
          password: 'weak'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isStrong).toBe(false);
      expect(response.body.data.reasons.length).toBeGreaterThan(0);
      expect(response.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('should reject request without password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/check-password-strength')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Password is required');
    });
  });

  describe('GET /api/v1/auth/generate-password', () => {
    it('should generate a strong password recommendation', async () => {
      const response = await request(app)
        .get('/api/v1/auth/generate-password')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('password');
      
      const generatedPassword = response.body.data.password;
      
expect(generatedPassword).toMatch(/^[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+-\d{2}[!@#$%^&*]$/);
    });

    it('should generate different passwords on multiple requests', async () => {
      const response1 = await request(app).get('/api/v1/auth/generate-password');
      const response2 = await request(app).get('/api/v1/auth/generate-password');
      
      expect(response1.body.data.password).not.toBe(response2.body.data.password);
    });
  });

  describe('Security Tests', () => {
    it('should never return password in any response', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_security',
          password: 'ValidPassword123!'
        });

      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('ValidPassword123!');
        expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should create different backup codes for different users', async () => {
      const response1 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_backup_1',
          password: 'ValidPassword123!'
        });

      const response2 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          login: 'test_backup_2',
          password: 'ValidPassword123!'
        });

      expect(response1.body.data.backupCode).not.toBe(response2.body.data.backupCode);
    });

    it('should sanitize SQL injection attempts', async () => {
      const sqlInjections = [
        "test'; DROP TABLE users; --",
        "test' OR '1'='1",
      ];

      for (const maliciousLogin of sqlInjections) {
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            login: maliciousLogin,
            password: 'ValidPassword123!'
          })
          .expect(400);
      }

      // Проверяем что таблица существует
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(result.rows).toBeDefined();
    });

    it('should handle concurrent registrations correctly', async () => {
      const promises = Array(5).fill(null).map((_, i) =>
        request(app)
          .post('/api/v1/auth/register')
          .send({
            login: `test_concurrent_${i}`,
            password: 'ValidPassword123!'
          })
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
      });
    });
  });
});