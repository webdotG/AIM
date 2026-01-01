// src/modules/analytics/__tests__/analytics.test.ts
import request from 'supertest';
import app from '../../../index';
import { pool } from '../../../db/pool';
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
      const response = await request(app)
        .get('/api/v1/analytics/activity-heatmap?year=2024')
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
});