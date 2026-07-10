import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Dreams Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_dreams_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('POST /api/v1/dreams', () => {
    it('should create a dream', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          content: 'I was flying over mountains',
          title: 'Flying Dream',
          lucidity: 7,
          vividness: 9,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('node');
      expect(response.body.data.node.node_type_code).toBe('dream');
      expect(response.body.data.dream.content).toBe('I was flying over mountains');
    });

    it('should reject missing content', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dreams', () => {
    it('should list all dreams', async () => {
      await TestFactories.createDream(testUser.id, { title: 'Dream 1' });
      await TestFactories.createDream(testUser.id, { title: 'Dream 2' });

      const response = await request(app)
        .get('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array if no dreams', async () => {
      const response = await request(app)
        .get('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });
  });

  describe('GET /api/v1/dreams/:id', () => {
    let dream: any;

    beforeEach(async () => {
      dream = await TestFactories.createDream(testUser.id, { content: 'A vivid dream' });
    });

    it('should get dream by id', async () => {
      const response = await request(app)
        .get(`/api/v1/dreams/${dream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.node.id).toBe(dream.node.id);
    });

    it('should return 404 for non-existent dream', async () => {
      const response = await request(app)
        .get('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/dreams/:id', () => {
    let dream: any;

    beforeEach(async () => {
      dream = await TestFactories.createDream(testUser.id);
    });

    it('should update dream', async () => {
      const response = await request(app)
        .put(`/api/v1/dreams/${dream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          title: 'Updated Dream Title',
          lucidity: 10,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/dreams/:id', () => {
    let dream: any;

    beforeEach(async () => {
      dream = await TestFactories.createDream(testUser.id);
    });

    it('should soft-delete dream', async () => {
      const response = await request(app)
        .delete(`/api/v1/dreams/${dream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should reject POST /api/v1/dreams without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .send({ content: 'test content' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject GET /api/v1/dreams without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/dreams')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject GET /api/v1/dreams/:id without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject PUT /api/v1/dreams/:id without auth token', async () => {
      const response = await request(app)
        .put('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject DELETE /api/v1/dreams/:id without auth token', async () => {
      const response = await request(app)
        .delete('/api/v1/dreams/00000000-0000-0000-0000-000000000000')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cross-user isolation', () => {
    let secondUser: any;
    let secondAuthToken: string;
    let usersDream: any;

    beforeEach(async () => {
      secondUser = await TestFactories.createUser({
        login: `second_dreams_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        password: 'TestPassword123!',
      });
      secondAuthToken = TestHelpers.createToken(secondUser.id, secondUser.login);
      usersDream = await TestFactories.createDream(testUser.id, { content: 'User A dream' });
    });

    afterEach(async () => {
      await TestFactories.cleanupUser(secondUser.id);
    });

    it('should return 404 when user B GETs user A dream', async () => {
      const response = await request(app)
        .get(`/api/v1/dreams/${usersDream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(secondAuthToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when user B PUTs user A dream', async () => {
      const response = await request(app)
        .put(`/api/v1/dreams/${usersDream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(secondAuthToken))
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when user B DELETEs user A dream', async () => {
      const response = await request(app)
        .delete(`/api/v1/dreams/${usersDream.node.id}`)
        .set('Authorization', TestHelpers.authHeader(secondAuthToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Query params', () => {
    it('should filter by from param', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);

      await TestFactories.createDream(testUser.id, {
        content: 'Old dream',
        dream_date: twoDaysAgo.toISOString(),
      });
      await TestFactories.createDream(testUser.id, {
        content: 'Recent dream',
        dream_date: yesterday.toISOString(),
      });

      const response = await request(app)
        .get('/api/v1/dreams')
        .query({ from: yesterday.toISOString() })
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.data.forEach((d: any) => {
        expect(new Date(d.dream_date) >= yesterday).toBe(true);
      });
    });

    it('should filter by to param', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      await TestFactories.createDream(testUser.id, {
        content: 'Old dream',
        dream_date: twoDaysAgo.toISOString(),
      });
      await TestFactories.createDream(testUser.id, {
        content: 'Recent dream',
        dream_date: yesterday.toISOString(),
      });

      const response = await request(app)
        .get('/api/v1/dreams')
        .query({ to: twoDaysAgo.toISOString() })
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((d: any) => {
        expect(new Date(d.dream_date) <= twoDaysAgo).toBe(true);
      });
    });

    it('should filter by nightmare=true param', async () => {
      await TestFactories.createDream(testUser.id, {
        content: 'Normal dream',
        nightmare: false,
      });
      await TestFactories.createDream(testUser.id, {
        content: 'Nightmare dream',
        nightmare: true,
      });

      const response = await request(app)
        .get('/api/v1/dreams')
        .query({ nightmare: 'true' })
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((d: any) => {
        expect(d.nightmare).toBe(true);
      });
    });
  });

  describe('Boundary values', () => {
    it('should reject lucidity 0', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ content: 'test', lucidity: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept lucidity 1', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ content: 'test', lucidity: 1, vividness: 1 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept lucidity 10', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ content: 'test', lucidity: 10, vividness: 1 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject lucidity 11', async () => {
      const response = await request(app)
        .post('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ content: 'test', lucidity: 11 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Invalid UUID', () => {
    it('should return 404 for non-uuid-string in GET', async () => {
      const response = await request(app)
        .get('/api/v1/dreams/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-uuid-string in PUT', async () => {
      const response = await request(app)
        .put('/api/v1/dreams/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-uuid-string in DELETE', async () => {
      const response = await request(app)
        .delete('/api/v1/dreams/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Deleted dream access', () => {
    let deletedDreamId: string;

    beforeEach(async () => {
      const dream = await TestFactories.createDream(testUser.id, { content: 'Dream to delete' });
      deletedDreamId = dream.node.id;
    });

    it('should not include soft-deleted dream in GET list', async () => {
      await request(app)
        .delete(`/api/v1/dreams/${deletedDreamId}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      const response = await request(app)
        .get('/api/v1/dreams')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      const ids = response.body.data.data.map((d: any) => d.node.id);
      expect(ids).not.toContain(deletedDreamId);
    });
  });
});