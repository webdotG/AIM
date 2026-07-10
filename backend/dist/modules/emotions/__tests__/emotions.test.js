"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const pool_1 = require("../../../db/pool");
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Emotions Module', () => {
    let testUser;
    let authToken;
    let testDream;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_emotions_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        testDream = await test_factories_1.TestFactories.createDream(testUser.id, {
            content: 'Test dream for emotions',
        });
        // Verify emotions exist
        const emotionsCount = await pool_1.pool.query('SELECT COUNT(*) FROM emotions');
        expect(parseInt(emotionsCount.rows[0].count)).toBeGreaterThan(0);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('GET /api/v1/emotions', () => {
        it('should list all emotions from dictionary', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(27);
            if (response.body.data.length > 0) {
                const emotion = response.body.data[0];
                expect(emotion).toHaveProperty('id');
                expect(emotion).toHaveProperty('name_en');
                expect(emotion).toHaveProperty('name_ru');
                expect(emotion).toHaveProperty('category');
                expect(emotion).toHaveProperty('code');
            }
        });
        it('should not require authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions')
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/v1/emotions/category/:category', () => {
        it('should list positive emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/category/positive')
                .expect(200);
            expect(response.body.success).toBe(true);
            if (response.body.data.length > 0) {
                response.body.data.forEach((emotion) => {
                    expect(emotion.category).toBe('positive');
                });
            }
        });
        it('should list negative emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/category/negative')
                .expect(200);
            expect(response.body.success).toBe(true);
            if (response.body.data.length > 0) {
                response.body.data.forEach((emotion) => {
                    expect(emotion.category).toBe('negative');
                });
            }
        });
        it('should list neutral emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/category/neutral')
                .expect(200);
            expect(response.body.success).toBe(true);
            if (response.body.data.length > 0) {
                response.body.data.forEach((emotion) => {
                    expect(emotion.category).toBe('neutral');
                });
            }
        });
    });
    describe('PUT /api/v1/emotions/node/:nodeId', () => {
        it('should attach emotions to a node', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [
                    { emotion_id: emotion.id, intensity: 8 },
                ],
            });
            expect([200, 201]).toContain(response.status);
            expect(response.body.success).toBe(true);
        });
        it('should attach multiple emotions to a node', async () => {
            const emotions = await pool_1.pool.query('SELECT * FROM emotions LIMIT 3');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: emotions.rows.map((e) => ({
                    emotion_id: e.id,
                    intensity: Math.floor(Math.random() * 10) + 1,
                })),
            });
            expect([200, 201]).toContain(response.status);
            expect(response.body.success).toBe(true);
        });
        it('should reject invalid intensity', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [
                    { emotion_id: emotion.id, intensity: 15 },
                ],
            });
            expect([400, 422].includes(response.status)).toBe(true);
            expect(response.body.success).toBe(false);
        });
        it('should reject non-existent emotion', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [
                    { emotion_id: 99999, intensity: 5 },
                ],
            });
            expect([400, 404, 422].includes(response.status)).toBe(true);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/emotions/node/:nodeId', () => {
        it('should get emotions for a node', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 7 }],
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });
        it('should return empty array if no emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
    });
    describe('DELETE /api/v1/emotions/node/:nodeId', () => {
        it('should remove all emotions from a node', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 7 }],
            });
            const deleteResponse = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken));
            expect([200, 204].includes(deleteResponse.status)).toBe(true);
            const checkResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(checkResponse.body.data.length).toBe(0);
        });
    });
    describe('GET /api/v1/emotions/stats', () => {
        it('should get emotion statistics', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/stats')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/emotions/most-frequent', () => {
        it('should get most frequent emotions', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/most-frequent?limit=5')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/emotions/distribution', () => {
        it('should return distribution with default granularity day', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            await test_factories_1.TestFactories.addEmotionToNode(testDream.node.id, 'Joy', 5);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/distribution')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should return distribution with granularity=day', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/distribution?granularity=day')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should return distribution with granularity=week', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/distribution?granularity=week')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
        it('should return distribution with granularity=month', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/distribution?granularity=month')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('Authentication required', () => {
        it('should reject PUT node without auth token', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 5 }],
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject DELETE node without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/emotions/node/${testDream.node.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject stats without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/stats')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject most-frequent without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/most-frequent')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Invalid category', () => {
        it('should reject invalid category "evil"', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/emotions/category/evil');
            expect([400, 404].includes(response.status)).toBe(true);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Cross-user isolation', () => {
        let otherUser;
        let otherDream;
        beforeEach(async () => {
            otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_emotions_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                password: 'TestPassword123!',
            });
            otherDream = await test_factories_1.TestFactories.createDream(otherUser.id, {
                content: 'Other user dream for cross-user test',
            });
        });
        afterEach(async () => {
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should not allow attaching emotions to another users node', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${otherDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 5 }],
            });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Intensity boundary values', () => {
        it('should reject intensity 0', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 0 }],
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should accept intensity 1', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 1 }],
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
        it('should accept intensity 10', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 10 }],
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
        it('should reject intensity 11', async () => {
            const emotion = await test_factories_1.TestFactories.findEmotion('Joy');
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [{ emotion_id: emotion.id, intensity: 11 }],
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Empty emotions array', () => {
        it('should accept PUT with empty emotions array', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/emotions/node/${testDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotions: [],
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
//# sourceMappingURL=emotions.test.js.map