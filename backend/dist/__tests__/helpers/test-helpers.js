"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestHelpers = void 0;
// src/__tests__/helpers/test-helpers.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
const JWTService_1 = require("../../modules/auth/services/JWTService");
class TestHelpers {
    static async registerUser(login, password) {
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/api/v1/auth/register')
            .send({ login, password })
            .expect(201);
        return {
            user: response.body.data.user,
            token: response.body.data.token,
            backupCode: response.body.data.backupCode,
        };
    }
    static async loginUser(login, password) {
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/api/v1/auth/login')
            .send({ login, password })
            .expect(200);
        return {
            user: response.body.data.user,
            token: response.body.data.token,
        };
    }
    static createToken(userId, login) {
        return JWTService_1.jwtService.sign({ userId, login });
    }
    static authHeader(token) {
        return `Bearer ${token}`;
    }
    static expectValidationError(response, field) {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation error');
        if (field) {
            expect(response.body.details).toBeDefined();
            const hasField = response.body.details.some((detail) => detail.path?.includes(field));
            expect(hasField).toBe(true);
        }
    }
    static expectAuthError(response) {
        expect(response.body.success).toBe(false);
        expect([401, 403].includes(response.status)).toBe(true);
    }
    static randomString(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    static generateLogin() {
        return `test_user_${this.randomString(8)}`;
    }
    static generateStrongPassword() {
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
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static async measureTime(fn) {
        const start = Date.now();
        const result = await fn();
        const elapsed = Date.now() - start;
        return { result, elapsed };
    }
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    static isValidISODate(date) {
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        return isoRegex.test(date) && !isNaN(Date.parse(date));
    }
    static createMockRequest(overrides = {}) {
        return {
            body: {},
            query: {},
            params: {},
            headers: {},
            ...overrides,
        };
    }
    static createMockResponse() {
        const res = {
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
exports.TestHelpers = TestHelpers;
//# sourceMappingURL=test-helpers.js.map