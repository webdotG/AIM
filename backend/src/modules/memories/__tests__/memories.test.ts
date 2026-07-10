import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Memories Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_memories_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('POST /api/v1/memories', () => {
    it('should create a memory', async () => {
      const response = await request(app)
        .post('/api/v1/memories')
        .set('Authorization', TestHelpers.authHeader(authToken))
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
      const response = await request(app)
        .post('/api/v1/memories')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/memories', () => {
    it('should list all memories', async () => {
      await TestFactories.createMemory(testUser.id, { title: 'Memory 1' });
      await TestFactories.createMemory(testUser.id, { title: 'Memory 2' });

      const response = await request(app)
        .get('/api/v1/memories')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/v1/memories/:id', () => {
    let memory: any;

    beforeEach(async () => {
      memory = await TestFactories.createMemory(testUser.id, { content: 'A memory' });
    });

    it('should get memory by id', async () => {
      const response = await request(app)
        .get(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.node.id).toBe(memory.node.id);
    });
  });

  describe('PATCH /api/v1/memories/:id', () => {
    let memory: any;

    beforeEach(async () => {
      memory = await TestFactories.createMemory(testUser.id);
    });

    it('should update memory', async () => {
      const response = await request(app)
        .put(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ confidence: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/memories/:id', () => {
    let memory: any;

    beforeEach(async () => {
      memory = await TestFactories.createMemory(testUser.id);
    });

    it('should soft-delete memory', async () => {
      const response = await request(app)
        .delete(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when creating a memory without auth', async () => {
      await request(app)
        .post('/api/v1/memories')
        .send({
          content: 'Unauthenticated memory',
          title: 'No Auth',
          confidence: 5,
        })
        .expect(401);
    });

    it('should return 401 when listing memories without auth', async () => {
      await request(app)
        .get('/api/v1/memories')
        .expect(401);
    });

    it('should return 401 when getting a memory without auth', async () => {
      const memory = await TestFactories.createMemory(testUser.id);

      await request(app)
        .get(`/api/v1/memories/${memory.node.id}`)
        .expect(401);
    });

    it('should return 401 when updating a memory without auth', async () => {
      const memory = await TestFactories.createMemory(testUser.id);

      await request(app)
        .put(`/api/v1/memories/${memory.node.id}`)
        .send({ confidence: 8 })
        .expect(401);
    });

    it('should return 401 when deleting a memory without auth', async () => {
      const memory = await TestFactories.createMemory(testUser.id);

      await request(app)
        .delete(`/api/v1/memories/${memory.node.id}`)
        .expect(401);
    });
  });

  describe('Cross-user isolation', () => {
    let otherUser: any;
    let otherAuthToken: string;

    beforeEach(async () => {
      otherUser = await TestFactories.createUser({
        login: `other_memories_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        password: 'TestPassword123!',
      });
      otherAuthToken = TestHelpers.createToken(otherUser.id, otherUser.login);
    });

    afterEach(async () => {
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should return 404 when another user GETs user B memory', async () => {
      const memory = await TestFactories.createMemory(testUser.id, { title: 'Private Memory' });

      await request(app)
        .get(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .expect(404);
    });

    it('should return 404 when another user PUTs user B memory', async () => {
      const memory = await TestFactories.createMemory(testUser.id);

      await request(app)
        .put(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .send({ confidence: 7 })
        .expect(404);
    });

    it('should return 404 when another user DELETEs user B memory', async () => {
      const memory = await TestFactories.createMemory(testUser.id);

      await request(app)
        .delete(`/api/v1/memories/${memory.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .expect(404);
    });
  });

  describe('Query params', () => {
    it('should filter memories by from_date', async () => {
      await TestFactories.createMemory(testUser.id, {
        content: 'Old memory',
        event_date: '2020-01-01',
      });
      await TestFactories.createMemory(testUser.id, {
        content: 'New memory',
        event_date: '2025-06-15',
      });

      const response = await request(app)
        .get('/api/v1/memories?from_date=2025-01-01')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
      for (const item of response.body.data.data) {
        expect(new Date(item.node.event_date) >= new Date('2025-01-01')).toBe(true);
      }
    });

    it('should filter memories by to_date', async () => {
      await TestFactories.createMemory(testUser.id, {
        content: 'Old memory',
        event_date: '2020-01-01',
      });
      await TestFactories.createMemory(testUser.id, {
        content: 'New memory',
        event_date: '2025-06-15',
      });

      const response = await request(app)
        .get('/api/v1/memories?to_date=2021-01-01')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
      for (const item of response.body.data.data) {
        expect(new Date(item.node.event_date) <= new Date('2021-01-01')).toBe(true);
      }
    });

    it('should filter memories by search term', async () => {
      await TestFactories.createMemory(testUser.id, {
        content: 'Birthday celebration',
        title: 'Birthday Party',
      });
      await TestFactories.createMemory(testUser.id, {
        content: 'Graduation day',
        title: 'Graduation',
      });

      const response = await request(app)
        .get('/api/v1/memories?search=Birthday')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
      for (const item of response.body.data.data) {
        const node = item.node;
        expect(
          node.content.toLowerCase().includes('birthday') ||
          node.title.toLowerCase().includes('birthday')
        ).toBe(true);
      }
    });
  });

  describe('Boundary values', () => {
    it('should reject confidence of 0', async () => {
      await request(app)
        .post('/api/v1/memories')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          content: 'Low confidence memory',
          title: 'Boundary Test',
          confidence: 0,
        })
        .expect(400);
    });

    it('should accept confidence of 10', async () => {
      const response = await request(app)
        .post('/api/v1/memories')
        .set('Authorization', TestHelpers.authHeader(authToken))
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
      await request(app)
        .get('/api/v1/memories/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);
    });

    it('should return 404 for non-uuid string as id on PUT', async () => {
      await request(app)
        .put('/api/v1/memories/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ confidence: 5 })
        .expect(404);
    });

    it('should return 404 for non-uuid string as id on DELETE', async () => {
      await request(app)
        .delete('/api/v1/memories/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);
    });
  });
});