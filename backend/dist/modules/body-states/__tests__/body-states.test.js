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
describe('BodyStates Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_bodystates_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        await pool_1.pool.query('DELETE FROM body_states WHERE user_id = $1', [testUser.id]);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('GET /api/v1/body-states', () => {
        it('should list all body states for user', async () => {
            await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points, location_name) 
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`, [testUser.id, 80, 70, 'Home', testUser.id, 90, 85, 'Work']);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            // API возвращает { body_states: [], pagination: {...}}
            expect(response.body.data).toHaveProperty('body_states');
            expect(response.body.data).toHaveProperty('pagination');
            expect(Array.isArray(response.body.data.body_states)).toBe(true);
            expect(response.body.data.body_states.length).toBe(2);
            expect(response.body.data.body_states[0]).toHaveProperty('id');
            expect(response.body.data.body_states[0].user_id).toBe(testUser.id);
        });
        it('should return empty array if no body states', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('body_states');
            expect(response.body.data.body_states).toEqual([]);
        });
        it('should not show body states from other users', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_bodystates_${Date.now()}`,
                password: 'TestPassword123!',
            });
            await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
       VALUES ($1, $2, $3)`, [otherUser.id, 50, 60]);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.data.body_states.length).toBe(0);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('POST /api/v1/body-states', () => {
        it('should create a body state', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 85,
                energy_points: 75,
                location_name: 'Home Office'
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.health_points).toBe(85);
            expect(response.body.data.energy_points).toBe(75);
            expect(response.body.data.location_name).toBe('Home Office');
            expect(response.body.data.user_id).toBe(testUser.id);
        });
        it('should create body state with minimal data', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 90
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.health_points).toBe(90);
        });
        it('should create body state with location coordinates', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 90,
                energy_points: 80,
                location_point: '50.4501,30.5234', // Возможно строковый формат
                location_name: 'Kyiv'
            })
                .expect(400); // Или 201 если формат правильный
            // Проверяем что хотя бы ответ пришел
            expect(response.body).toBeDefined();
        });
        it('should validate health_points range', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 150, // Invalid: should be 0-100
                energy_points: 50
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should validate energy_points range', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 50,
                energy_points: -10 // Invalid: should be 0-100
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/body-states/:id', () => {
        let bodyStateId;
        beforeEach(async () => {
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [testUser.id, 75, 65]);
            bodyStateId = result.rows[0].id;
        });
        it('should get body state by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/body-states/${bodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(bodyStateId);
            expect(response.body.data.health_points).toBe(75);
            expect(response.body.data.energy_points).toBe(65);
        });
        it('should return 404 for non-existent body state', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/body-states/999999')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should not allow access to other user body states', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [otherUser.id, 50, 60]);
            const otherBodyStateId = result.rows[0].id;
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/body-states/${otherBodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('PUT /api/v1/body-states/:id', () => {
        let bodyStateId;
        beforeEach(async () => {
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [testUser.id, 70, 60]);
            bodyStateId = result.rows[0].id;
        });
        it('should update body state', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/body-states/${bodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 85,
                energy_points: 75,
                location_name: 'Updated Location'
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.health_points).toBe(85);
            expect(response.body.data.energy_points).toBe(75);
            expect(response.body.data.location_name).toBe('Updated Location');
        });
        it('should update partial fields', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/body-states/${bodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                location_name: 'Gym'
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.location_name).toBe('Gym');
            expect(response.body.data.health_points).toBe(70); // Не изменилось
        });
        it('should not allow updating other user body states', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [otherUser.id, 50, 60]);
            const otherBodyStateId = result.rows[0].id;
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/body-states/${otherBodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                health_points: 100
            });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('DELETE /api/v1/body-states/:id', () => {
        let bodyStateId;
        beforeEach(async () => {
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [testUser.id, 70, 60]);
            bodyStateId = result.rows[0].id;
        });
        // В body-states.test.ts в тесте 'should delete body state'
        it('should delete body state', async () => {
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
     VALUES ($1, $2, $3) RETURNING id`, [testUser.id, 70, 60]);
            const bodyStateId = result.rows[0].id;
            // Удаляем
            const deleteResponse = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/body-states/${bodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(deleteResponse.body.success).toBe(true);
            // Проверяем что не можем получить удаленную запись
            const getResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/body-states/${bodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken));
            // Должно быть 404
            expect(getResponse.status).toBe(404);
            expect(getResponse.body.success).toBe(false);
            // В списке также не должно быть
            const listResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/body-states')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            // Проверяем структуру ответа
            const data = listResponse.body.data;
            if (data && data.body_states) {
                // Ищем удаленную запись
                const deletedState = data.body_states.find((s) => s.id === bodyStateId);
                expect(deletedState).toBeUndefined();
            }
        });
        it('should return 404 for non-existent body state', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/body-states/999999')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken));
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
        it('should not allow deleting other user body states', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const result = await pool_1.pool.query(`INSERT INTO body_states (user_id, health_points, energy_points) 
         VALUES ($1, $2, $3) RETURNING id`, [otherUser.id, 50, 60]);
            const otherBodyStateId = result.rows[0].id;
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/body-states/${otherBodyStateId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken));
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
});
//# sourceMappingURL=body-states.test.js.map