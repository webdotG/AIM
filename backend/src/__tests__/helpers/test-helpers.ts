// src/__tests__/helpers/test-helpers.ts
import request from 'supertest';
import app from '../../index';
import { jwtService } from '../../modules/auth/services/JWTService';

export class TestHelpers {
  /**
   * Регистрирует пользователя и возвращает данные с токеном
   */
  static async registerUser(login: string, password: string) {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ login, password })
      .expect(201);

    return {
      user: response.body.data.user,
      token: response.body.data.token,
      backupCode: response.body.data.backupCode,
    };
  }

  /**
   * Логинит пользователя
   */
  static async loginUser(login: string, password: string) {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ login, password })
      .expect(200);

    return {
      user: response.body.data.user,
      token: response.body.data.token,
    };
  }

  /**
   * Создает JWT токен для пользователя (без регистрации)
   */
  static createToken(userId: number, login: string): string {
    return jwtService.sign({ userId, login });
  }

  /**
   * Создает Authorization header
   */
  static authHeader(token: string): string {
    return `Bearer ${token}`;
  }

  /**
   * Проверяет что ответ содержит ошибку валидации
   */
  static expectValidationError(response: any, field?: string) {
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
    
    if (field) {
      expect(response.body.details).toBeDefined();
      const hasField = response.body.details.some(
        (detail: any) => detail.path?.includes(field)
      );
      expect(hasField).toBe(true);
    }
  }

  /**
   * Проверяет что ответ содержит ошибку авторизации
   */
  static expectAuthError(response: any) {
    expect(response.body.success).toBe(false);
    expect([401, 403]).toContain(response.status);
  }

  /**
   * Генерирует случайную строку
   */
  static randomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Генерирует валидный логин
   */
  static generateLogin(): string {
    return `test_user_${this.randomString(8)}`;
  }

  /**
   * Генерирует сильный пароль
   */
  static generateStrongPassword(): string {
    const words = ['Purple', 'Monkey', 'Battery', 'Horse', 'Dragon'];
    const randomWords = [
      words[Math.floor(Math.random() * words.length)],
      words[Math.floor(Math.random() * words.length)],
    ];
    const number = Math.floor(Math.random() * 90) + 10;
    const symbols = '!@#$%^&*';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    return `${randomWords[0]}-${randomWords[1]}-${number}${symbol}`;
  }

  /**
   * Ждет указанное количество миллисекунд
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Измеряет время выполнения функции
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; elapsed: number }> {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    return { result, elapsed };
  }

  /**
   * Форматирует UUID для проверок
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Проверяет формат даты ISO 8601
   */
  static isValidISODate(date: string): boolean {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(date) && !isNaN(Date.parse(date));
  }

  /**
   * Создает мок request для тестирования middleware
   */
  static createMockRequest(overrides: any = {}) {
    return {
      body: {},
      query: {},
      params: {},
      headers: {},
      ...overrides,
    };
  }

  /**
   * Создает мок response для тестирования middleware
   */
  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  }

  /**
   * Создает мок next для тестирования middleware
   */
  static createMockNext() {
    return jest.fn();
  }
}