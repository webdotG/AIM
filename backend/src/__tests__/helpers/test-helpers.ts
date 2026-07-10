// src/__tests__/helpers/test-helpers.ts
import request from 'supertest';
import app from '../../index';
import { jwtService } from '../../modules/auth/services/JWTService';

export class TestHelpers {
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

  static createToken(userId: number, login: string): string {
    return jwtService.sign({ userId, login });
  }

  static authHeader(token: string): string {
    return `Bearer ${token}`;
  }

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

  static expectAuthError(response: any) {
    expect(response.body.success).toBe(false);
    expect([401, 403].includes(response.status)).toBe(true);
  }

  static randomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateLogin(): string {
    return `test_user_${this.randomString(8)}`;
  }

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

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; elapsed: number }> {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    return { result, elapsed };
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidISODate(date: string): boolean {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(date) && !isNaN(Date.parse(date));
  }

  static createMockRequest(overrides: any = {}) {
    return {
      body: {},
      query: {},
      params: {},
      headers: {},
      ...overrides,
    };
  }

  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  }

  static createMockNext() {
    return jest.fn();
  }
}