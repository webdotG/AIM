"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Memories Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_memories_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/memories', () => {
        it('should create a memory', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/memories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'First day at school',
                title: 'School Memory',
                event_date: '2020-09-01',
                confidence: 9,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('node');
            expect(response.body.data.node.node_type_code).toBe('memory');
        });
        it('should reject missing content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/memories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({})
                .expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/memories', () => {
        it('should list all memories', async () => {
            await test_factories_1.TestFactories.createMemory(testUser.id, { title: 'Memory 1' });
            await test_factories_1.TestFactories.createMemory(testUser.id, { title: 'Memory 2' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
        });
    });
    describe('GET /api/v1/memories/:id', () => {
        let memory;
        beforeEach(async () => {
            memory = await test_factories_1.TestFactories.createMemory(testUser.id, { content: 'A memory' });
        });
        it('should get memory by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.node.id).toBe(memory.node.id);
        });
    });
    describe('PATCH /api/v1/memories/:id', () => {
        let memory;
        beforeEach(async () => {
            memory = await test_factories_1.TestFactories.createMemory(testUser.id);
        });
        it('should update memory', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ confidence: 10 })
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('DELETE /api/v1/memories/:id', () => {
        let memory;
        beforeEach(async () => {
            memory = await test_factories_1.TestFactories.createMemory(testUser.id);
        });
        it('should soft-delete memory', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('Authentication', () => {
        it('should return 401 when creating a memory without auth', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/memories')
                .send({
                content: 'Unauthenticated memory',
                title: 'No Auth',
                confidence: 5,
            })
                .expect(401);
        });
        it('should return 401 when listing memories without auth', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories')
                .expect(401);
        });
        it('should return 401 when getting a memory without auth', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/memories/${memory.node.id}`)
                .expect(401);
        });
        it('should return 401 when updating a memory without auth', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/memories/${memory.node.id}`)
                .send({ confidence: 8 })
                .expect(401);
        });
        it('should return 401 when deleting a memory without auth', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/memories/${memory.node.id}`)
                .expect(401);
        });
    });
    describe('Cross-user isolation', () => {
        let otherUser;
        let otherAuthToken;
        beforeEach(async () => {
            otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_memories_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                password: 'TestPassword123!',
            });
            otherAuthToken = test_helpers_1.TestHelpers.createToken(otherUser.id, otherUser.login);
        });
        afterEach(async () => {
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should return 404 when another user GETs user B memory', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id, { title: 'Private Memory' });
            await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(otherAuthToken))
                .expect(404);
        });
        it('should return 404 when another user PUTs user B memory', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(otherAuthToken))
                .send({ confidence: 7 })
                .expect(404);
        });
        it('should return 404 when another user DELETEs user B memory', async () => {
            const memory = await test_factories_1.TestFactories.createMemory(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/memories/${memory.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(otherAuthToken))
                .expect(404);
        });
    });
    describe('Query params', () => {
        it('should filter memories by from_date', async () => {
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'Old memory',
                event_date: '2020-01-01',
            });
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'New memory',
                event_date: '2025-06-15',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories?from_date=2025-01-01')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            for (const item of response.body.data.data) {
                expect(new Date(item.node.event_date) >= new Date('2025-01-01')).toBe(true);
            }
        });
        it('should filter memories by to_date', async () => {
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'Old memory',
                event_date: '2020-01-01',
            });
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'New memory',
                event_date: '2025-06-15',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories?to_date=2021-01-01')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            for (const item of response.body.data.data) {
                expect(new Date(item.node.event_date) <= new Date('2021-01-01')).toBe(true);
            }
        });
        it('should filter memories by search term', async () => {
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'Birthday celebration',
                title: 'Birthday Party',
            });
            await test_factories_1.TestFactories.createMemory(testUser.id, {
                content: 'Graduation day',
                title: 'Graduation',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories?search=Birthday')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            for (const item of response.body.data.data) {
                const node = item.node;
                expect(node.content.toLowerCase().includes('birthday') ||
                    node.title.toLowerCase().includes('birthday')).toBe(true);
            }
        });
    });
    describe('Boundary values', () => {
        it('should reject confidence of 0', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/memories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Low confidence memory',
                title: 'Boundary Test',
                confidence: 0,
            })
                .expect(400);
        });
        it('should accept confidence of 10', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/memories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Perfect confidence memory',
                title: 'Boundary Test',
                confidence: 10,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
        });
    });
    describe('Invalid UUID', () => {
        it('should return 404 for non-uuid string as id on GET', async () => {
            await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/memories/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
        });
        it('should return 404 for non-uuid string as id on PUT', async () => {
            await (0, supertest_1.default)(index_1.default)
                .put('/api/v1/memories/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({ confidence: 5 })
                .expect(404);
        });
        it('should return 404 for non-uuid string as id on DELETE', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/memories/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
        });
    });
});
//# sourceMappingURL=memories.test.js.map