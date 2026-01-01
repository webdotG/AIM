"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/skills/__tests__/skills.test.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const pool_1 = require("../../../db/pool");
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Skills Module', () => {
    let testUser;
    let authToken;
    let testSkillId;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_skills_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        // Очищаем старые навыки
        await pool_1.pool.query('DELETE FROM skills WHERE user_id = $1', [testUser.id]);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('GET /api/v1/skills', () => {
        it('should get all skills for user', async () => {
            // Сначала создаем тестовый навык
            await pool_1.pool.query('INSERT INTO skills (user_id, name, category, description, current_level) VALUES ($1, $2, $3, $4, $5)', [testUser.id, 'Meditation', 'mindfulness', 'Daily meditation practice', 5]);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/skills')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('POST /api/v1/skills', () => {
        it('should create a skill', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/skills')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                name: 'Programming',
                category: 'professional',
                description: 'Software development skills',
                current_level: 1,
                color: '#3498db'
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe('Programming');
            testSkillId = response.body.data.id;
        });
        it('should reject duplicate skill names for same user', async () => {
            await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/skills')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                name: 'Unique Skill',
                category: 'personal'
            })
                .expect(201);
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/skills')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                name: 'Unique Skill',
                category: 'personal'
            });
            expect([400, 409, 422]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/skills/:id', () => {
        beforeEach(async () => {
            const result = await pool_1.pool.query('INSERT INTO skills (user_id, name, category) VALUES ($1, $2, $3) RETURNING id', [testUser.id, 'Test Skill', 'test']);
            testSkillId = result.rows[0].id;
        });
        it('should get skill by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/skills/${testSkillId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testSkillId);
            expect(response.body.data.name).toBe('Test Skill');
        });
        it('should return 404 for non-existent skill', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/skills/999999')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/v1/skills/:id/progress', () => {
        beforeEach(async () => {
            const result = await pool_1.pool.query('INSERT INTO skills (user_id, name, category, current_level, experience_points) VALUES ($1, $2, $3, $4, $5) RETURNING id', [testUser.id, 'Progress Test', 'test', 1, 0]);
            testSkillId = result.rows[0].id;
        });
        // В skills.test.ts тесте "should add progress to skill"
        it('should add progress to skill', async () => {
            // Создаем запись или body_state для привязки
            const entry = await test_factories_1.TestFactories.createEntry(testUser.id, {
                entry_type: 'thought',
                content: 'Progress test entry'
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/skills/${testSkillId}/progress`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                experience_gained: 100,
                notes: 'Practice session',
                progress_type: 'practice',
                entry_id: entry.id // Добавляем entry_id
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/skills/top', () => {
        it('should get top skills', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/skills/top?limit=5')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
    describe('GET /api/v1/skills/categories', () => {
        it('should get skill categories', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/skills/categories')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
});
//# sourceMappingURL=skills.test.js.map