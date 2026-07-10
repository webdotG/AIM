"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../../index"));
const test_factories_1 = require("../../../__tests__/helpers/test-factories");
const test_helpers_1 = require("../../../__tests__/helpers/test-helpers");
describe('Measurements Module', () => {
    let testUser;
    let authToken;
    let testNode;
    let measureDef;
    beforeEach(async () => {
        testUser = await test_factories_1.TestFactories.createUser({
            login: `test_measurements_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            password: 'TestPassword123!',
        });
        authToken = test_helpers_1.TestHelpers.createToken(testUser.id, testUser.login);
        testNode = await test_factories_1.TestFactories.createNode(testUser.id, 'conversation', 'Test Node for Measurements');
        measureDef = await test_factories_1.TestFactories.createMeasurementDefinition({
            code: `test_measure_${Date.now()}`,
            name: 'Test Measurement',
            data_type: 'integer',
            default_unit: 'km',
        });
    });
    afterEach(async () => {
        await test_factories_1.TestFactories.cleanupUser(testUser.id);
    });
    describe('POST /api/v1/measurements/node/:nodeId', () => {
        it('should create a measurement with integer value', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 42,
                unit: 'km',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(Number(response.body.data.value_integer)).toBe(42);
            expect(response.body.data.unit).toBe('km');
        });
        it('should create a measurement with decimal value', async () => {
            const decimalDef = await test_factories_1.TestFactories.createMeasurementDefinition({
                code: `test_decimal_${Date.now()}`,
                name: 'Decimal Measure',
                data_type: 'decimal',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: decimalDef.id,
                value_decimal: 3.14,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.value_decimal).toBe(3.14);
        });
        it('should create a measurement with boolean value', async () => {
            const boolDef = await test_factories_1.TestFactories.createMeasurementDefinition({
                code: `test_bool_${Date.now()}`,
                name: 'Boolean Measure',
                data_type: 'boolean',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: boolDef.id,
                value_boolean: true,
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.value_boolean).toBe(true);
        });
        it('should create a measurement with text value', async () => {
            const textDef = await test_factories_1.TestFactories.createMeasurementDefinition({
                code: `test_text_${Date.now()}`,
                name: 'Text Measure',
                data_type: 'text',
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: textDef.id,
                value_text: 'some measurement note',
            })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.value_text).toBe('some measurement note');
        });
        it('should reject when no value field provided', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject when multiple value fields provided', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 42,
                value_text: 'also text',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 42,
            })
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherNode = await test_factories_1.TestFactories.createNode(otherUser.id, 'conversation');
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${otherNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 42,
            })
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .send({
                measurement_id: measureDef.id,
                value_integer: 42,
            })
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/measurements/node/:nodeId', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 10,
                unit: 'm',
            });
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 25,
                unit: 'm',
            });
        });
        it('should list measurements for a node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });
        it('should return empty array for node with no measurements', async () => {
            const emptyNode = await test_factories_1.TestFactories.createNode(testUser.id, 'conversation', 'Empty Node');
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/measurements/node/${emptyNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherNode = await test_factories_1.TestFactories.createNode(otherUser.id, 'conversation');
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/measurements/node/${otherNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/measurements/node/${testNode.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('DELETE /api/v1/measurements/node/:nodeId', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(index_1.default)
                .post(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .send({
                measurement_id: measureDef.id,
                value_integer: 10,
            });
        });
        it('should delete all measurements for a node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('removed');
            expect(response.body.data.removed).toBeGreaterThanOrEqual(1);
        });
        it('should return removed 0 when deleting from node with no measurements', async () => {
            const emptyNode = await test_factories_1.TestFactories.createNode(testUser.id, 'conversation', 'Empty');
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/measurements/node/${emptyNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.removed).toBe(0);
        });
        it('should verify measurements are actually removed', async () => {
            await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken));
            const getResponse = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/measurements/node/${testNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(200);
            expect(getResponse.body.data.length).toBe(0);
        });
        it('should return 404 for non-existent node', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for other user node', async () => {
            const otherUser = await test_factories_1.TestFactories.createUser();
            const otherNode = await test_factories_1.TestFactories.createNode(otherUser.id, 'conversation');
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/measurements/node/${otherNode.id}`)
                .set('Authorization', test_helpers_1.TestHelpers.authHeader(authToken))
                .expect(404);
            expect(response.body.success).toBe(false);
            await test_factories_1.TestFactories.cleanupUser(otherUser.id);
        });
        it('should reject without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/measurements/node/${testNode.id}`)
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=measurements.test.js.map