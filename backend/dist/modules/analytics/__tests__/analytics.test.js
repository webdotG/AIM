"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
            const currentYear = new Date().getFullYear();
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/analytics/activity-heatmap?year=${currentYear}`)
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
    describe('GET /api/v1/analytics/profile', () => {
        it('should get user profile', async () => {
            await test_factories_1.TestFactories.createDream(testUser.id);
            await test_factories_1.TestFactories.createThought(testUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/profile')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/analytics/node-connections', () => {
        it('should get node connections', async () => {
            const n1 = await test_factories_1.TestFactories.createDream(testUser.id);
            const n2 = await test_factories_1.TestFactories.createThought(testUser.id);
            await test_factories_1.TestFactories.createEdge(n1.node.id, n2.node.id, 'related_to');
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/node-connections')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/analytics/emotion-timeline', () => {
        it('should get emotion timeline with default granularity', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-timeline')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should get emotion timeline with granularity=day', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-timeline?granularity=day')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should get emotion timeline with granularity=week', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-timeline?granularity=week')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should get emotion timeline with granularity=month', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-timeline?granularity=month')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('Authentication', () => {
        it('should return 401 without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/stats')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Empty data scenarios', () => {
        it('should return empty stats for new user with no nodes', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/stats')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(typeof response.body.data).toBe('object');
        });
        it('should return empty array for entries-by-month with no nodes', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/entries-by-month')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return empty array for emotion-distribution with no emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-distribution')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return empty array for activity-heatmap with no nodes', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/activity-heatmap')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return zero streaks for new user with no nodes', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/streaks')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.current_streak).toBe(0);
        });
        it('should return empty timeline for new user with no emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/emotion-timeline')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return empty array for node-connections with no edges', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/node-connections')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return default profile data for new user with no nodes', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/profile')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.total_nodes).toBe(0);
            expect(response.body.data.node_stats).toBeDefined();
            expect(response.body.data.streaks.current_streak).toBe(0);
        });
    });
    describe('Response structure', () => {
        it('should have node_stats, emotion_distribution, streaks, total_nodes fields in profile response', async () => {
            await test_factories_1.TestFactories.createDream(testUser.id);
            await test_factories_1.TestFactories.createThought(testUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/analytics/profile')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('node_stats');
            expect(response.body.data).toHaveProperty('emotion_distribution');
            expect(response.body.data).toHaveProperty('streaks');
            expect(response.body.data).toHaveProperty('total_nodes');
        });
    });
});
//# sourceMappingURL=analytics.test.js.map