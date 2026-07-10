import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Measurements Module', () => {
  let testUser: any;
  let authToken: string;
  let testNode: any;
  let measureDef: any;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_measurements_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);

    testNode = await TestFactories.createNode(testUser.id, 'conversation', 'Test Node for Measurements');

    measureDef = await TestFactories.createMeasurementDefinition({
      code: `test_measure_${Date.now()}`,
      name: 'Test Measurement',
      data_type: 'integer',
      default_unit: 'km',
    });
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('POST /api/v1/measurements/node/:nodeId', () => {
    it('should create a measurement with integer value', async () => {
      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
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
      const decimalDef = await TestFactories.createMeasurementDefinition({
        code: `test_decimal_${Date.now()}`,
        name: 'Decimal Measure',
        data_type: 'decimal',
      });

      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: decimalDef.id,
          value_decimal: 3.14,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value_decimal).toBe(3.14);
    });

    it('should create a measurement with boolean value', async () => {
      const boolDef = await TestFactories.createMeasurementDefinition({
        code: `test_bool_${Date.now()}`,
        name: 'Boolean Measure',
        data_type: 'boolean',
      });

      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: boolDef.id,
          value_boolean: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value_boolean).toBe(true);
    });

    it('should create a measurement with text value', async () => {
      const textDef = await TestFactories.createMeasurementDefinition({
        code: `test_text_${Date.now()}`,
        name: 'Text Measure',
        data_type: 'text',
      });

      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: textDef.id,
          value_text: 'some measurement note',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value_text).toBe('some measurement note');
    });

    it('should reject when no value field provided', async () => {
      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject when multiple value fields provided', async () => {
      const response = await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 42,
          value_text: 'also text',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app)
        .post('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 42,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user node', async () => {
      const otherUser = await TestFactories.createUser();
      const otherNode = await TestFactories.createNode(otherUser.id, 'conversation');

      const response = await request(app)
        .post(`/api/v1/measurements/node/${otherNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 42,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
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
      await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 10,
          unit: 'm',
        });

      await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 25,
          unit: 'm',
        });
    });

    it('should list measurements for a node', async () => {
      const response = await request(app)
        .get(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for node with no measurements', async () => {
      const emptyNode = await TestFactories.createNode(testUser.id, 'conversation', 'Empty Node');

      const response = await request(app)
        .get(`/api/v1/measurements/node/${emptyNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app)
        .get('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user node', async () => {
      const otherUser = await TestFactories.createUser();
      const otherNode = await TestFactories.createNode(otherUser.id, 'conversation');

      const response = await request(app)
        .get(`/api/v1/measurements/node/${otherNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/measurements/node/${testNode.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/measurements/node/:nodeId', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          measurement_id: measureDef.id,
          value_integer: 10,
        });
    });

    it('should delete all measurements for a node', async () => {
      const response = await request(app)
        .delete(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('removed');
      expect(response.body.data.removed).toBeGreaterThanOrEqual(1);
    });

    it('should return removed 0 when deleting from node with no measurements', async () => {
      const emptyNode = await TestFactories.createNode(testUser.id, 'conversation', 'Empty');

      const response = await request(app)
        .delete(`/api/v1/measurements/node/${emptyNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.removed).toBe(0);
    });

    it('should verify measurements are actually removed', async () => {
      await request(app)
        .delete(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken));

      const getResponse = await request(app)
        .get(`/api/v1/measurements/node/${testNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(getResponse.body.data.length).toBe(0);
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app)
        .delete('/api/v1/measurements/node/00000000-0000-0000-0000-000000000000')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user node', async () => {
      const otherUser = await TestFactories.createUser();
      const otherNode = await TestFactories.createNode(otherUser.id, 'conversation');

      const response = await request(app)
        .delete(`/api/v1/measurements/node/${otherNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/measurements/node/${testNode.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});