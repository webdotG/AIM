"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Actions Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_actions_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/actions', () => {
        it('should create an action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/actions')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                description: 'Ran 5km this morning',
                title: 'Morning Run',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('node');
            expect(response.body.data.node.node_type_code).toBe('action');
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/actions')
                .send({
                description: 'Ran 5km this morning',
                title: 'Morning Run',
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should auto-set started_at to NOW when not provided', async () => {
            const before = new Date();
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/actions')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                description: 'Action without started_at',
                title: 'Auto Started',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.action).toHaveProperty('started_at');
            const startedAt = new Date(response.body.data.action.started_at);
            expect(startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(startedAt.getTime()).toBeLessThanOrEqual(Date.now());
        });
    });
    describe('GET /api/v1/actions', () => {
        it('should list all actions', async () => {
            await test_factories_1.TestFactories.createAction(testUser.id, { title: 'Action 1' });
            await test_factories_1.TestFactories.createAction(testUser.id, { title: 'Action 2' });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/actions')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.data)).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/actions')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/actions/:id', () => {
        let action;
        beforeEach(async () => {
            action = await test_factories_1.TestFactories.createAction(testUser.id, { description: 'An action' });
        });
        it('should get action by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/actions/${action.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.node.id).toBe(action.node.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/actions/${action.node.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('PATCH /api/v1/actions/:id', () => {
        let action;
        beforeEach(async () => {
            action = await test_factories_1.TestFactories.createAction(testUser.id);
        });
        it('should update action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/actions/${action.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                finished_at: new Date().toISOString(),
            })
                .expect(200);
            expect(response.body.success).toBe(true);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/actions/${action.node.id}`)
                .send({
                finished_at: new Date().toISOString(),
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('DELETE /api/v1/actions/:id', () => {
        let action;
        beforeEach(async () => {
            action = await test_factories_1.TestFactories.createAction(testUser.id);
        });
        it('should soft-delete action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/actions/${action.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/actions/${action.node.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Cross-user isolation', () => {
        let otherUser;
        let otherUserToken;
        let otherUserAction;
        beforeEach(async () => {
            otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_actions_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                password: 'TestPassword123!',
            });
            otherUserToken = test_helpers_1.TestHelpers.createToken(otherUser.id, otherUser.login);
            otherUserAction = await test_factories_1.TestFactories.createAction(otherUser.id, { title: "Other user's action" });
        });
        afterEach(async () => {
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should not GET another user action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/actions/${otherUserAction.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should not PUT another user action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/actions/${otherUserAction.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                description: 'Attempted hijack',
            })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should not DELETE another user action', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/actions/${otherUserAction.node.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Query parameters', () => {
        it('should filter actions with from_date and to_date', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await test_factories_1.TestFactories.createAction(testUser.id, {
                title: 'Past Action',
                started_at: yesterday.toISOString(),
            });
            await test_factories_1.TestFactories.createAction(testUser.id, {
                title: 'Future Action',
                started_at: tomorrow.toISOString(),
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/actions')
                .query({
                from: tomorrow.toISOString().split('T')[0],
                to: tomorrow.toISOString(),
            })
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
            response.body.data.data.forEach((action) => {
                const actionDate = new Date(action.started_at);
                expect(actionDate.toISOString().slice(0, 10)).toBe(tomorrow.toISOString().slice(0, 10));
            });
        });
    });
    describe('Invalid UUID', () => {
        it('should return 404 for non-uuid-string as :id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/actions/non-uuid-string')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Non-existent ID', () => {
        it('should return 404 for 00000000-0000-0000-0000-000000000000', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/actions/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=actions.test.js.map