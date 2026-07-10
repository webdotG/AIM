import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Plans Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_plans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('POST /api/v1/plans', () => {
    it('should create a plan', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          description: 'Learn TypeScript thoroughly',
          title: 'TS Learning Plan',
          priority: 8,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('node');
      expect(response.body.data.node.node_type_code).toBe('plan');
    });

    it('should reject missing description', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/plans', () => {
    it('should list all plans', async () => {
      await TestFactories.createPlan(testUser.id, { title: 'Plan 1' });
      await TestFactories.createPlan(testUser.id, { title: 'Plan 2' });

      const response = await request(app)
        .get('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/v1/plans/:id', () => {
    let plan: any;

    beforeEach(async () => {
      plan = await TestFactories.createPlan(testUser.id, { description: 'A plan' });
    });

    it('should get plan by id', async () => {
      const response = await request(app)
        .get(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.node.id).toBe(plan.node.id);
    });
  });

  describe('PATCH /api/v1/plans/:id', () => {
    let plan: any;

    beforeEach(async () => {
      plan = await TestFactories.createPlan(testUser.id);
    });

    it('should update plan', async () => {
      const response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ priority: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should mark plan as completed', async () => {
      const response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: true })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/plans/:id', () => {
    let plan: any;

    beforeEach(async () => {
      plan = await TestFactories.createPlan(testUser.id);
    });

    it('should soft-delete plan', async () => {
      const response = await request(app)
        .delete(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when creating plan without auth', async () => {
      await request(app)
        .post('/api/v1/plans')
        .send({ description: 'Unauthenticated plan' })
        .expect(401);
    });

    it('should return 401 when listing plans without auth', async () => {
      await request(app)
        .get('/api/v1/plans')
        .expect(401);
    });

    it('should return 401 when getting plan by id without auth', async () => {
      const plan = await TestFactories.createPlan(testUser.id);

      await request(app)
        .get(`/api/v1/plans/${plan.node.id}`)
        .expect(401);
    });

    it('should return 401 when updating plan without auth', async () => {
      const plan = await TestFactories.createPlan(testUser.id);

      await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .send({ priority: 5 })
        .expect(401);
    });

    it('should return 401 when deleting plan without auth', async () => {
      const plan = await TestFactories.createPlan(testUser.id);

      await request(app)
        .delete(`/api/v1/plans/${plan.node.id}`)
        .expect(401);
    });
  });

  describe('Cross-user isolation', () => {
    let otherUser: any;
    let otherAuthToken: string;
    let plan: any;

    beforeEach(async () => {
      otherUser = await TestFactories.createUser({
        login: `other_plans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        password: 'TestPassword123!',
      });
      otherAuthToken = TestHelpers.createToken(otherUser.id, otherUser.login);
      plan = await TestFactories.createPlan(testUser.id, { title: 'Owner Plan' });
    });

    afterEach(async () => {
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should return 404 when another user GETs the plan', async () => {
      await request(app)
        .get(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .expect(404);
    });

    it('should return 404 when another user updates the plan', async () => {
      await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .send({ priority: 5 })
        .expect(404);
    });

    it('should return 404 when another user deletes the plan', async () => {
      await request(app)
        .delete(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(otherAuthToken))
        .expect(404);
    });
  });

  describe('Query params', () => {
    it('should filter by completed=true', async () => {
      await TestFactories.createPlan(testUser.id, { title: 'Done Plan', completed: true });
      await TestFactories.createPlan(testUser.id, { title: 'Active Plan', completed: false });

      const response = await request(app)
        .get('/api/v1/plans?completed=true')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((p: any) => {
        expect(p.completed).toBe(true);
      });
    });

    it('should filter by completed=false', async () => {
      await TestFactories.createPlan(testUser.id, { title: 'Done Plan', completed: true });
      await TestFactories.createPlan(testUser.id, { title: 'Active Plan', completed: false });

      const response = await request(app)
        .get('/api/v1/plans?completed=false')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((p: any) => {
        expect(p.completed).toBe(false);
      });
    });

    it('should filter by overdue=true', async () => {
      const pastDeadline = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await TestFactories.createPlan(testUser.id, { title: 'Overdue Plan', deadline: pastDeadline, completed: false });
      await TestFactories.createPlan(testUser.id, { title: 'Future Plan', deadline: futureDeadline, completed: false });
      await TestFactories.createPlan(testUser.id, { title: 'Completed Plan', deadline: pastDeadline, completed: true });

      const response = await request(app)
        .get('/api/v1/plans?overdue=true')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((p: any) => {
        expect(p.completed).toBe(false);
        expect(new Date(p.deadline) < new Date()).toBe(true);
      });
    });

    it('should return empty array when no plans match overdue filter', async () => {
      const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await TestFactories.createPlan(testUser.id, { title: 'Future Plan', deadline: futureDeadline, completed: false });

      const response = await request(app)
        .get('/api/v1/plans?overdue=true')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(0);
    });
  });

  describe('Boundary values for priority', () => {
    it('should reject priority 0 on creation', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ description: 'Low priority plan', priority: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject priority 11 on creation', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ description: 'High priority plan', priority: 11 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept priority 5 (mid-range) on creation', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ description: 'Mid priority plan', priority: 5 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept priority 1 (minimum valid)', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ description: 'Minimum priority plan', priority: 1 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept priority 10 (maximum valid)', async () => {
      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ description: 'Maximum priority plan', priority: 10 })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Invalid UUID', () => {
    it('should return 404 for non-uuid-string as id on GET', async () => {
      await request(app)
        .get('/api/v1/plans/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);
    });

    it('should return 404 for non-uuid-string as id on PUT', async () => {
      await request(app)
        .put('/api/v1/plans/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ priority: 5 })
        .expect(404);
    });

    it('should return 404 for non-uuid-string as id on DELETE', async () => {
      await request(app)
        .delete('/api/v1/plans/non-uuid-string')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);
    });
  });

  describe('Completed toggle', () => {
    it('should set completed_at when marking plan as completed', async () => {
      const plan = await TestFactories.createPlan(testUser.id);

      const response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plan.completed).toBe(true);
      expect(response.body.data.plan.completed_at).toBeDefined();
      expect(new Date(response.body.data.plan.completed_at).getTime()).toBeGreaterThan(0);
    });

    it('should clear completed_at when marking plan as not completed', async () => {
      const plan = await TestFactories.createPlan(testUser.id, { completed: true });

      const completeResponse = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: true })
        .expect(200);

      expect(completeResponse.body.data.plan.completed_at).toBeDefined();

      const uncompleteResponse = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: false })
        .expect(200);

      expect(uncompleteResponse.body.success).toBe(true);
      expect(uncompleteResponse.body.data.plan.completed).toBe(false);
      expect(uncompleteResponse.body.data.plan.completed_at).toBeNull();
    });

    it('should toggle completed back and forth', async () => {
      const plan = await TestFactories.createPlan(testUser.id);

      let response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: true })
        .expect(200);
      expect(response.body.data.plan.completed).toBe(true);
      expect(response.body.data.plan.completed_at).toBeDefined();

      response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: false })
        .expect(200);
      expect(response.body.data.plan.completed).toBe(false);
      expect(response.body.data.plan.completed_at).toBeNull();

      response = await request(app)
        .put(`/api/v1/plans/${plan.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ completed: true })
        .expect(200);
      expect(response.body.data.plan.completed).toBe(true);
      expect(response.body.data.plan.completed_at).toBeDefined();
    });
  });
});