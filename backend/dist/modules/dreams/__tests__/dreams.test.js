"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Dreams Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_dreams_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/dreams', () => {
        it('should create a dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'I was flying over mountains',
                title: 'Flying Dream',
                lucidity: 7,
                vividness: 9,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('node');
            expect(response.body.data.node.node_type_code).toBe('dream');
            expect(response.body.data.dream.content).toBe('I was flying over mountains');
        });
        it('should reject missing content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({})
                .expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/dreams', () => {
        it('should list all dreams', async () => {
            await test_factories_1.TestFactories.createDream(testUser.id, { title: 'Dream 1' });
            await test_factories_1.TestFactories.createDream(testUser.id, { title: 'Dream 2' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
        });
        it('should return empty array if no dreams', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.data)).toBe(true);
        });
    });
    describe('GET /api/v1/dreams/:id', () => {
        let dream;
        beforeEach(async () => {
            dream = await test_factories_1.TestFactories.createDream(testUser.id, { content: 'A vivid dream' });
        });
        it('should get dream by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/dreams/${dream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.node.id).toBe(dream.node.id);
        });
        it('should return 404 for non-existent dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('PATCH /api/v1/dreams/:id', () => {
        let dream;
        beforeEach(async () => {
            dream = await test_factories_1.TestFactories.createDream(testUser.id);
        });
        it('should update dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/dreams/${dream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                title: 'Updated Dream Title',
                lucidity: 10,
            })
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('DELETE /api/v1/dreams/:id', () => {
        let dream;
        beforeEach(async () => {
            dream = await test_factories_1.TestFactories.createDream(testUser.id);
        });
        it('should soft-delete dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/dreams/${dream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('Authentication', () => {
        it('should reject POST /api/v1/dreams without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .send({ content: 'test content' })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject GET /api/v1/dreams without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject GET /api/v1/dreams/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject PUT /api/v1/dreams/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
                .send({ title: 'Updated' })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject DELETE /api/v1/dreams/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Cross-user isolation', () => {
        let secondUser;
        let secondAuthToken;
        let usersDream;
        beforeEach(async () => {
            secondUser = await test_factories_1.TestFactories.createUser({
                login: `second_dreams_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                password: 'TestPassword123!',
            });
            secondAuthToken = test_helpers_1.TestHelpers.createToken(secondUser.id, secondUser.login);
            usersDream = await test_factories_1.TestFactories.createDream(testUser.id, { content: 'User A dream' });
        });
        afterEach(async () => {
            await test_factories_1.TestFactories.cleanupUser(secondUser.id);
        });
        it('should return 404 when user B GETs user A dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/dreams/${usersDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(secondAuthToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 when user B PUTs user A dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/dreams/${usersDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(secondAuthToken))
                .send({ title: 'Hacked' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 when user B DELETEs user A dream', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/dreams/${usersDream.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(secondAuthToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Query params', () => {
        it('should filter by from param', async () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            const twoDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Old dream',
                dream_date: twoDaysAgo.toISOString(),
            });
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Recent dream',
                dream_date: yesterday.toISOString(),
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .query({ from: yesterday.toISOString() })
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            response.body.data.data.forEach((d) => {
                expect(new Date(d.dream_date) >= yesterday).toBe(true);
            });
        });
        it('should filter by to param', async () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Old dream',
                dream_date: twoDaysAgo.toISOString(),
            });
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Recent dream',
                dream_date: yesterday.toISOString(),
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .query({ to: twoDaysAgo.toISOString() })
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            response.body.data.data.forEach((d) => {
                expect(new Date(d.dream_date) <= twoDaysAgo).toBe(true);
            });
        });
        it('should filter by nightmare=true param', async () => {
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Normal dream',
                nightmare: false,
            });
            await test_factories_1.TestFactories.createDream(testUser.id, {
                content: 'Nightmare dream',
                nightmare: true,
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .query({ nightmare: 'true' })
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            response.body.data.data.forEach((d) => {
                expect(d.nightmare).toBe(true);
            });
        });
    });
    describe('Boundary values', () => {
        it('should reject lucidity 0', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'test', lucidity: 0 })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should accept lucidity 1', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'test', lucidity: 1, vividness: 1 })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
        it('should accept lucidity 10', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'test', lucidity: 10, vividness: 1 })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
        it('should reject lucidity 11', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'test', lucidity: 11 })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Invalid UUID', () => {
        it('should return 404 for non-uuid-string in GET', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-uuid-string in PUT', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put('/api/v1/dreams/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ title: 'Updated' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-uuid-string in DELETE', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/dreams/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Deleted dream access', () => {
        let deletedDreamId;
        beforeEach(async () => {
            const dream = await test_factories_1.TestFactories.createDream(testUser.id, { content: 'Dream to delete' });
            deletedDreamId = dream.node.id;
        });
        it('should not include soft-deleted dream in GET list', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/dreams/${deletedDreamId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/dreams')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            const ids = response.body.data.data.map((d) => d.node.id);
            expect(ids).not.toContain(deletedDreamId);
        });
    });
});
//# sourceMappingURL=dreams.test.js.map