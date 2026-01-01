// src/modules/relations/__tests__/relations.test.ts
import request from 'supertest';
import app from '../../../index';
import { pool } from '../../../db/pool';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Relations Module', () => {
  let testUser: any;
  let authToken: string;
  let entry1: any;
  let entry2: any;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_relations_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
    
    // Создаем две тестовые записи для связей
    entry1 = await TestFactories.createEntry(testUser.id, {
      entry_type: 'dream',
      content: 'First test dream'
    });
    
    entry2 = await TestFactories.createEntry(testUser.id, {
      entry_type: 'memory',
      content: 'Second test memory'
    });
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/relations/types', () => {
    it('should get relation types', async () => {
      const response = await request(app)
        .get('/api/v1/relations/types')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/v1/relations', () => {
// В relations.test.ts тесте "should create relation between entries"
it('should create relation between entries', async () => {
  const response = await request(app)
    .post('/api/v1/relations')
    .set('Authorization', TestHelpers.authHeader(authToken))
    .send({
      from_entry_id: entry1.id,
      to_entry_id: entry2.id,
      relation_type: 'related_to',  // Изменяем с 'related' на 'related_to'
      description: 'These entries are related'
    })
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
});

    it('should reject self-relation', async () => {
      const response = await request(app)
        .post('/api/v1/relations')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          from_entry_id: entry1.id,
          to_entry_id: entry1.id, // Same entry
          relation_type: 'related',
          description: 'Self relation'
        });

      expect([400, 422]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/relations/entry/:entryId', () => {
    it('should get relations for entry', async () => {
      // Сначала создаем связь
      await pool.query(
        'INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type) VALUES ($1, $2, $3)',
        [entry1.id, entry2.id, 'related']
      );

      const response = await request(app)
        .get(`/api/v1/relations/entry/${entry1.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/relations/most-connected', () => {
    it('should get most connected entries', async () => {
      const response = await request(app)
        .get('/api/v1/relations/most-connected')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('DELETE /api/v1/relations/:id', () => {
    it('should delete relation', async () => {
      // Сначала создаем связь
      const result = await pool.query(
        'INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type) VALUES ($1, $2, $3) RETURNING id',
        [entry1.id, entry2.id, 'related']
      );
      const relationId = result.rows[0].id;

      const response = await request(app)
        .delete(`/api/v1/relations/${relationId}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});