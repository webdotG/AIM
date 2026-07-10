import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Analytics Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_analytics_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/analytics/stats', () => {
    it('should get overall stats', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/stats')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/entries-by-month', () => {
    it('should get entries by month', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/entries-by-month')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should accept months parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/entries-by-month?months=6')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/emotion-distribution', () => {
    it('should get emotion distribution', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-distribution')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/activity-heatmap', () => {
    it('should get activity heatmap', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/activity-heatmap')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should accept year parameter', async () => {
      const currentYear = new Date().getFullYear();
      const response = await request(app)
        .get(`/api/v1/analytics/activity-heatmap?year=${currentYear}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/streaks', () => {
    it('should get streaks', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/streaks')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/profile', () => {
    it('should get user profile', async () => {
      await TestFactories.createDream(testUser.id);
      await TestFactories.createThought(testUser.id);

      const response = await request(app)
        .get('/api/v1/analytics/profile')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/node-connections', () => {
    it('should get node connections', async () => {
      const n1 = await TestFactories.createDream(testUser.id);
      const n2 = await TestFactories.createThought(testUser.id);
      await TestFactories.createEdge(n1.node.id, n2.node.id, 'related_to');

      const response = await request(app)
        .get('/api/v1/analytics/node-connections')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/emotion-timeline', () => {
    it('should get emotion timeline with default granularity', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-timeline')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get emotion timeline with granularity=day', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-timeline?granularity=day')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get emotion timeline with granularity=week', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-timeline?granularity=week')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get emotion timeline with granularity=month', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-timeline?granularity=month')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Empty data scenarios', () => {
    it('should return empty stats for new user with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/stats')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(typeof response.body.data).toBe('object');
    });

    it('should return empty array for entries-by-month with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/entries-by-month')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return empty array for emotion-distribution with no emotions', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-distribution')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return empty array for activity-heatmap with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/activity-heatmap')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return zero streaks for new user with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/streaks')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.current_streak).toBe(0);
    });

    it('should return empty timeline for new user with no emotions', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/emotion-timeline')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return empty array for node-connections with no edges', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/node-connections')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return default profile data for new user with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/profile')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_nodes).toBe(0);
      expect(response.body.data.node_stats).toBeDefined();
      expect(response.body.data.streaks.current_streak).toBe(0);
    });
  });

  describe('Response structure', () => {
    it('should have node_stats, emotion_distribution, streaks, total_nodes fields in profile response', async () => {
      await TestFactories.createDream(testUser.id);
      await TestFactories.createThought(testUser.id);

      const response = await request(app)
        .get('/api/v1/analytics/profile')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('node_stats');
      expect(response.body.data).toHaveProperty('emotion_distribution');
      expect(response.body.data).toHaveProperty('streaks');
      expect(response.body.data).toHaveProperty('total_nodes');
    });
  });
});