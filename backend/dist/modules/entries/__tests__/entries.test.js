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
describe('Entries Module - Complete Test Suite', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        // Создаем тестового пользователя для КАЖДОГО теста
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_entries_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        // Очищаем entries перед каждым тестом
        await pool_1.pool.query('DELETE FROM entries WHERE user_id = $1', [testUser.id]);
    });
    afterEach(async () => {
        // Очищаем пользователя после каждого теста
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/entries - Create Entry', () => {
        it('should create a dream entry', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'dream',
                content: 'I dreamed about flying over mountains',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(test_helpers_1.TestHelpers.isValidUUID(response.body.data.id)).toBe(true);
            expect(response.body.data.entry_type).toBe('dream');
            expect(response.body.data.content).toBe('I dreamed about flying over mountains');
            expect(response.body.data.user_id).toBe(testUser.id);
        });
        // Закомментирован debug тест
        /*
        it('debug: check app routes', async () => {
          console.log('=== APP ROUTES DEBUG ===');
          
          // Проверим health endpoint
          const healthResponse = await request(app).get('/health');
          console.log('Health endpoint:', healthResponse.status);
          
          // Проверим правильный entries endpoint
          const entriesResponse = await request(app)
            .get('/api/v1/entries')
            .set('Authorization', TestHelpers.authHeader(authToken));
          
          console.log('Entries endpoint status:', entriesResponse.status);
          console.log('Entries endpoint body:', entriesResponse.body);
          
          // Проверим неправильный endpoint (без /api/v1)
          const wrongResponse = await request(app)
            .get('/entries')
            .set('Authorization', TestHelpers.authHeader(authToken));
          
          console.log('Wrong endpoint status:', wrongResponse.status);
        });
        */
        it('should create a memory entry', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'memory',
                content: 'I remember my first day at school',
            })
                .expect(201);
            expect(response.body.data.entry_type).toBe('memory');
        });
        it('should create a thought entry', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'thought',
                content: 'What is the meaning of life?',
            })
                .expect(201);
            expect(response.body.data.entry_type).toBe('thought');
        });
        it('should create a plan entry with deadline', async () => {
            const deadline = new Date('2026-12-31');
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'plan',
                content: 'Learn TypeScript deeply',
                deadline: deadline.toISOString().split('T')[0],
            })
                .expect(201);
            expect(response.body.data.entry_type).toBe('plan');
            expect(response.body.data.deadline).toBeDefined();
            expect(response.body.data.is_completed).toBe(false);
        });
        it('should create entry with body_state', async () => {
            const bodyState = await test_factories_1.TestFactories.createBodyState(testUser.id, {
                health_points: 85,
                energy_points: 75,
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'dream',
                content: 'Dream with context',
                body_state_id: bodyState.id,
            })
                .expect(201);
            expect(response.body.data.body_state_id).toBe(bodyState.id);
        });
        it('should create entry with circumstance', async () => {
            const circumstance = await test_factories_1.TestFactories.createCircumstance(testUser.id, {
                weather: 'rainy',
                temperature: 15,
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'dream',
                content: 'Dream on a rainy day',
                circumstance_id: circumstance.id,
            })
                .expect(201);
            expect(response.body.data.circumstance_id).toBe(circumstance.id);
        });
        it('should reject entry without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .send({
                entry_type: 'dream',
                content: 'Test',
            })
                .expect(401);
            test_helpers_1.TestHelpers.expectAuthError(response);
        });
        it('should reject entry with invalid type', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'invalid_type',
                content: 'Test',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject entry without content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'dream',
            })
                .expect(400);
            test_helpers_1.TestHelpers.expectValidationError(response);
        });
        it('should reject entry with empty content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                entry_type: 'dream',
                content: '',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/entries - List Entries', () => {
        beforeEach(async () => {
            // Создаем несколько entries для тестов
            await test_factories_1.TestFactories.createEntry(testUser.id, {
                entry_type: 'dream',
                content: 'Dream 1',
            });
            await test_factories_1.TestFactories.createEntry(testUser.id, {
                entry_type: 'memory',
                content: 'Memory 1',
            });
            await test_factories_1.TestFactories.createEntry(testUser.id, {
                entry_type: 'thought',
                content: 'Thought 1',
            });
        });
        it('should list all user entries', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('entries');
            expect(Array.isArray(response.body.data.entries)).toBe(true);
            expect(response.body.data.entries.length).toBe(3);
        });
        it('should filter entries by type', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/entries?type=dream')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.data.entries.length).toBe(1);
            expect(response.body.data.entries[0].entry_type).toBe('dream');
        });
        it('should paginate entries', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/entries?limit=2&offset=0')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.data.entries.length).toBe(2);
        });
        it('should not show entries from other users', async () => {
            // Создаем другого пользователя с entry
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            await test_factories_1.TestFactories.createEntry(otherUser.id, {
                content: 'Other user entry',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/entries')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            // Должны видеть только свои 3 записи
            expect(response.body.data.entries.length).toBe(3);
            expect(response.body.data.entries.every((e) => e.user_id === testUser.id)).toBe(true);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('GET /api/v1/entries/:id - Get Single Entry', () => {
        let entryId;
        beforeEach(async () => {
            const entry = await test_factories_1.TestFactories.createEntry(testUser.id, {
                content: 'Test entry for retrieval',
            });
            entryId = entry.id;
        });
        it('should get entry by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/entries/${entryId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(entryId);
            expect(response.body.data.content).toBe('Test entry for retrieval');
        });
        it('should return 404 for non-existent entry', async () => {
            const fakeUUID = '00000000-0000-4000-8000-000000000000';
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/entries/${fakeUUID}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should not allow access to other user entries', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const otherEntry = await test_factories_1.TestFactories.createEntry(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/entries/${otherEntry.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(403);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('PUT /api/v1/entries/:id - Update Entry', () => {
        let entryId;
        beforeEach(async () => {
            const entry = await test_factories_1.TestFactories.createEntry(testUser.id, {
                content: 'Original content',
            });
            entryId = entry.id;
        });
        it('should update entry content', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/entries/${entryId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Updated content',
            })
                .expect(200);
            expect(response.body.data.content).toBe('Updated content');
            expect(response.body.data.updated_at).not.toBe(response.body.data.created_at);
        });
        it('should mark plan as completed', async () => {
            const plan = await test_factories_1.TestFactories.createEntry(testUser.id, {
                entry_type: 'plan',
                content: 'Task to complete',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/entries/${plan.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                is_completed: true,
            })
                .expect(200);
            expect(response.body.data.is_completed).toBe(true);
        });
        it('should not allow updating other user entries', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const otherEntry = await test_factories_1.TestFactories.createEntry(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/entries/${otherEntry.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                content: 'Trying to update',
            })
                .expect(403);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('DELETE /api/v1/entries/:id - Delete Entry', () => {
        it('should delete entry', async () => {
            const entry = await test_factories_1.TestFactories.createEntry(testUser.id);
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/entries/${entry.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(204);
            // Проверяем что entry действительно удален
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/entries/${entry.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
        });
        it('should not allow deleting other user entries', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const otherEntry = await test_factories_1.TestFactories.createEntry(otherUser.id);
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/entries/${otherEntry.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(403);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('Entry Relationships', () => {
        it('should add emotions to entry', async () => {
            const entry = await test_factories_1.TestFactories.createEntry(testUser.id);
            // Получаем случайную эмоцию
            const emotion = await test_factories_1.TestFactories.getRandomEmotion();
            // Получаем существующую эмоцию из БД
            const emotions = await pool_1.pool.query('SELECT id FROM emotions WHERE name_en = $1 OR name_ru = $1', [emotion.name_en || 'Joy']);
            const emotionId = emotions.rows[0]?.id || emotion.id;
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/entries/${entry.id}/emotions`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                emotion_id: emotionId,
                intensity: 8,
            })
                .expect(201); // Вернуть обратно 201
            expect(response.body.success).toBe(true);
        });
    });
});
//# sourceMappingURL=entries.test.js.map