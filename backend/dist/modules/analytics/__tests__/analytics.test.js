"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/analytics/__tests__/analytics.test.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Analytics Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_analytics_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('GET /api/v1/analytics/stats', () => {
        it('should get overall stats', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/stats')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/analytics/entries-by-month', () => {
        it('should get entries by month', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/entries-by-month')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should accept months parameter', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/entries-by-month?months=6')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/v1/analytics/emotion-distribution', () => {
        it('should get emotion distribution', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-distribution')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/analytics/activity-heatmap', () => {
        it('should get activity heatmap', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/activity-heatmap')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should accept year parameter', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/activity-heatmap?year=2024')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/v1/analytics/streaks', () => {
        it('should get streaks', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/streaks')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
});
//# sourceMappingURL=analytics.test.js.map