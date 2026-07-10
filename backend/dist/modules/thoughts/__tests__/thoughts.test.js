"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Thoughts Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_thoughts_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/thoughts', () => {
        it('should create a thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Important thought about life',
                title: 'Life Insight',
                importance: 8,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('node');
            expect(response.body.data.node.node_type_code).toBe('thought');
        });
        it('should reject missing content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({})
                .expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/thoughts', () => {
        it('should list all thoughts', async () => {
            await test_factories_1.TestFactories.createThought(testUser.id, { title: 'Thought 1' });
            await test_factories_1.TestFactories.createThought(testUser.id, { title: 'Thought 2' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
        });
        it('should return empty array if no thoughts', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.data)).toBe(true);
        });
    });
    describe('GET /api/v1/thoughts/:id', () => {
        let thought;
        beforeEach(async () => {
            thought = await test_factories_1.TestFactories.createThought(testUser.id, { content: 'A thought' });
        });
        it('should get thought by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/thoughts/${thought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.node.id).toBe(thought.node.id);
        });
    });
    describe('PATCH /api/v1/thoughts/:id', () => {
        let thought;
        beforeEach(async () => {
            thought = await test_factories_1.TestFactories.createThought(testUser.id);
        });
        it('should update thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/thoughts/${thought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ importance: 10 })
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('DELETE /api/v1/thoughts/:id', () => {
        let thought;
        beforeEach(async () => {
            thought = await test_factories_1.TestFactories.createThought(testUser.id);
        });
        it('should soft-delete thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/thoughts/${thought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('Authentication', () => {
        it('should return 401 when POST /api/v1/thoughts without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .send({
                content: 'Unauthorized thought',
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 when GET /api/v1/thoughts without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 when GET /api/v1/thoughts/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts/some-id')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 when PUT /api/v1/thoughts/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put('/api/v1/thoughts/some-id')
                .send({ content: 'Updated' })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 when DELETE /api/v1/thoughts/:id without auth token', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/thoughts/some-id')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Cross-user isolation', () => {
        let userB;
        let userBToken;
        let userAThought;
        beforeEach(async () => {
            userB = await test_factories_1.TestFactories.createUser({
                login: `test_thoughts_b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                password: 'TestPassword123!',
            });
            userBToken = test_helpers_1.TestHelpers.createToken(userB.id, userB.login);
            userAThought = await test_factories_1.TestFactories.createThought(testUser.id, {
                content: 'User A secret thought',
                title: 'Private Thought',
            });
        });
        afterEach(async () => {
            await test_factories_1.TestFactories.cleanupUser(userB.id);
        });
        it('should return 404 when user B GETs user A thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/thoughts/${userAThought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(userBToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 when user B PUTs user A thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/thoughts/${userAThought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(userBToken))
                .send({ content: 'Hacked content' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 when user B DELETEs user A thought', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/thoughts/${userAThought.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(userBToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Query params', () => {
        it('should filter by from date', async () => {
            await test_factories_1.TestFactories.createThought(testUser.id, { title: 'Old thought' });
            const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .query({ from: futureDate })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBe(0);
        });
        it('should filter by to date', async () => {
            await test_factories_1.TestFactories.createThought(testUser.id, { title: 'New thought' });
            const pastDate = new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0];
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .query({ to: pastDate })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBe(0);
        });
        it('should filter by search term', async () => {
            await test_factories_1.TestFactories.createThought(testUser.id, {
                title: 'Unique search test',
                content: 'This is a unique search test content',
            });
            await test_factories_1.TestFactories.createThought(testUser.id, {
                title: 'Other thought',
                content: 'Something completely different',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .query({ search: 'unique' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data.data[0].content).toContain('unique');
        });
        it('should combine date and search filters', async () => {
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            await test_factories_1.TestFactories.createThought(testUser.id, {
                title: 'Searchable today thought',
                content: 'This thought is searchable today',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .query({ from: today, to: tomorrow, search: 'searchable' })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
        });
    });
    describe('Boundary values', () => {
        it('should reject importance: 0', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with zero importance',
                importance: 0,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should accept importance: 10', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with max importance',
                importance: 10,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
        it('should accept importance: 1', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with min valid importance',
                importance: 1,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
        it('should reject importance: 11', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with over max importance',
                importance: 11,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject confidence: 0', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with zero confidence',
                confidence: 0,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should accept confidence: 10', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/thoughts')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Thought with max confidence',
                confidence: 10,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
    });
    describe('Invalid UUID', () => {
        it('should return 404 for non-uuid string as id on GET', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/thoughts/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-uuid string as id on PUT', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put('/api/v1/thoughts/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'Updated' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-uuid string as id on DELETE', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/thoughts/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Non-existent ID', () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        it('should return 404 for non-existent id on GET', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/thoughts/${nonExistentId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-existent id on PUT', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/thoughts/${nonExistentId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ content: 'Updated' })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-existent id on DELETE', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/thoughts/${nonExistentId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=thoughts.test.js.map