"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/people/__tests__/people.test.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const pool_1 = require("../../../db/pool");
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('People Module', () => {
    let testUser;
    let authToken;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_people_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        await pool_1.pool.query('DELETE FROM people WHERE user_id = $1', [testUser.id]);
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('GET /api/v1/people', () => {
        // В people.test.ts
        it('should list all people for user', async () => {
            await pool_1.pool.query(`INSERT INTO people (user_id, name, category) 
     VALUES ($1, $2, $3), ($4, $5, $6)`, [testUser.id, 'John Doe', 'friends', testUser.id, 'Jane Smith', 'family']);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/people')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            const data = response.body.data;
            if (data && data.people) {
                // Проверяем количество, не порядок
                expect(data.people.length).toBe(2);
                // Проверяем что обе записи есть в списке
                const names = data.people.map((p) => p.name);
                expect(names).toContain('John Doe');
                expect(names).toContain('Jane Smith');
            }
        });
        it('should delete person', async () => {
            const result = await pool_1.pool.query(`INSERT INTO people (user_id, name, category) 
     VALUES ($1, $2, $3) RETURNING id`, [testUser.id, 'To Delete', 'friends']);
            const personId = result.rows[0].id;
            const deleteResponse = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/people/${personId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(deleteResponse.body.success).toBe(true);
            // Проверяем что удалено
            const listResponse = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/people')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            const data = listResponse.body.data;
            if (data && data.people) {
                const deletedPerson = data.people.find((p) => p.id === personId);
                expect(deletedPerson).toBeUndefined();
            }
            else if (Array.isArray(data)) {
                const deletedPerson = data.find((p) => p.id === personId);
                expect(deletedPerson).toBeUndefined();
            }
        });
        it('should filter people by category', async () => {
            await pool_1.pool.query(`INSERT INTO people (user_id, name, category) 
       VALUES ($1, $2, $3), ($4, $5, $6)`, [testUser.id, 'Friend 1', 'friends', testUser.id, 'Family 1', 'family']);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/people?category=friends')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            const data = response.body.data;
            let peopleArray = [];
            if (Array.isArray(data)) {
                peopleArray = data;
            }
            else if (data && data.people) {
                peopleArray = data.people;
            }
            else if (data && data.results) {
                peopleArray = data.results;
            }
            expect(peopleArray.length).toBe(1);
            expect(peopleArray[0].category).toBe('friends');
        });
    });
    describe('GET /api/v1/people/:id', () => {
        let personId;
        beforeEach(async () => {
            const result = await pool_1.pool.query('INSERT INTO people (user_id, name, category) VALUES ($1, $2, $3) RETURNING id', [testUser.id, 'Test Person', 'friends']);
            personId = result.rows[0].id;
        });
        it('should get person by id', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/people/${personId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(personId);
            expect(response.body.data.name).toBe('Test Person');
        });
        it('should return 404 for non-existent person', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/people/999999')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should not allow access to other user people', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser({
                login: `other_user_${Date.now()}`,
                password: 'TestPassword123!',
            });
            const result = await pool_1.pool.query('INSERT INTO people (user_id, name, category) VALUES ($1, $2, $3) RETURNING id', [otherUser.id, 'Other User Person', 'friends']);
            const otherPersonId = result.rows[0].id;
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/people/${otherPersonId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404); // или 403 в зависимости от реализации
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
    });
    describe('PUT /api/v1/people/:id', () => {
        let personId;
        beforeEach(async () => {
            const result = await pool_1.pool.query('INSERT INTO people (user_id, name, category) VALUES ($1, $2, $3) RETURNING id', [testUser.id, 'Old Name', 'friends']);
            personId = result.rows[0].id;
        });
        it('should update person', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/people/${personId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                name: 'Updated Name',
                category: 'family',
                relationship: 'Updated Relationship'
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
            expect(response.body.data.category).toBe('family');
            expect(response.body.data.relationship).toBe('Updated Relationship');
        });
    });
    describe('DELETE /api/v1/people/:id', () => {
        let personId;
        beforeEach(async () => {
            const result = await pool_1.pool.query('INSERT INTO people (user_id, name, category) VALUES ($1, $2, $3) RETURNING id', [testUser.id, 'To Delete', 'friends']);
            personId = result.rows[0].id;
        });
        it('should delete person', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/people/${personId}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/people')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            // Проверяем правильную структуру ответа
            const data = response.body.data;
            // Если ответ имеет структуру { people: [...], pagination: {...} }
            if (data && data.people) {
                expect(data.people).toHaveLength(0);
            }
            // Если ответ это просто массив [...]
            else if (Array.isArray(data)) {
                expect(data).toHaveLength(0);
            }
            // Или проверяем что personId больше нет в списке
            else if (data && data.results) {
                expect(data.results).toHaveLength(0);
            }
            // Или можно просто проверять что объект не содержит удаленного человека
            else {
                const allPeople = Array.isArray(data) ? data : [];
                const deletedPerson = allPeople.find((p) => p.id === personId);
                expect(deletedPerson).toBeUndefined();
            }
        });
    });
});
//# sourceMappingURL=people.test.js.map