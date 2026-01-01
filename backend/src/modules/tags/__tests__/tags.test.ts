// src/modules/tags/__tests__/tags.test.ts
import request from 'supertest';
import app from '../../../index';
import { pool } from '../../../db/pool';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Tags Module - Complete Test Suite', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_tags_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
    
    // Очищаем теги перед каждым тестом
    await pool.query('DELETE FROM tags WHERE user_id = $1', [testUser.id]);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/tags', () => {
    it('should list all user tags', async () => {
      // Создаем несколько тегов
      await TestFactories.createTag(testUser.id, 'lucid');
      await TestFactories.createTag(testUser.id, 'recurring');
      await TestFactories.createTag(testUser.id, 'nightmare');

      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      
      // Проверяем структуру тегов
      response.body.data.forEach((tag: any) => {
        expect(tag).toHaveProperty('id');
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('user_id');
        expect(tag.user_id).toBe(testUser.id);
      });
    });

    it('should return empty array if no tags', async () => {
      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should not show tags from other users', async () => {
      const otherUser = await TestFactories.createUser({
        login: `other_user_${Date.now()}`,
        password: 'TestPassword123!',
      });
      await TestFactories.createTag(otherUser.id, 'other-tag');
      await TestFactories.createTag(testUser.id, 'my-tag');

      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('my-tag');
      expect(response.body.data[0].user_id).toBe(testUser.id);
      
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('POST /api/v1/tags', () => {
    it('should create a tag', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          name: 'test-tag'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('test-tag');
      expect(response.body.data.user_id).toBe(testUser.id);
    });

    it('should reject tag without name', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject empty tag name', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate tag names for same user', async () => {
      // Создаем первый тег
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'duplicate' })
        .expect(201);

      // Пытаемся создать дубликат
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'duplicate' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should allow same tag name for different users', async () => {
      const otherUser = await TestFactories.createUser({
        login: `other_user_${Date.now()}`,
        password: 'TestPassword123!',
      });
      const otherToken = TestHelpers.createToken(otherUser.id, otherUser.login);

      // Тег для первого пользователя
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'shared-tag' })
        .expect(201);

      // Такой же тег для второго пользователя
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(otherToken))
        .send({ name: 'shared-tag' })
        .expect(201);

      expect(response.body.success).toBe(true);
      
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('GET /api/v1/tags/:id', () => {
    let tagId: string;

    beforeEach(async () => {
      const tag = await TestFactories.createTag(testUser.id, 'test-tag');
      tagId = tag.id;
    });

    it('should get tag by id', async () => {
      const response = await request(app)
        .get(`/api/v1/tags/${tagId}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tagId);
      expect(response.body.data.name).toBe('test-tag');
    });

    it('should return 404 for non-existent tag', async () => {
      const fakeId = 999999;
      
      const response = await request(app)
        .get(`/api/v1/tags/${fakeId}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow access to other user tags', async () => {
      const otherUser = await TestFactories.createUser({
        login: `other_user_${Date.now()}`,
        password: 'TestPassword123!',
      });
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');

      const response = await request(app)
        .get(`/api/v1/tags/${otherTag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(403);

      expect(response.body.success).toBe(false);
      
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('PUT /api/v1/tags/:id', () => {
    let tagId: string;

    beforeEach(async () => {
      const tag = await TestFactories.createTag(testUser.id, 'old-name');
      tagId = tag.id;
    });

    it('should update tag name', async () => {
      const response = await request(app)
        .put(`/api/v1/tags/${tagId}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'new-name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('new-name');
    });

    it('should not allow updating other user tags', async () => {
      const otherUser = await TestFactories.createUser({
        login: `other_user_${Date.now()}`,
        password: 'TestPassword123!',
      });
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');

      const response = await request(app)
        .put(`/api/v1/tags/${otherTag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'try-to-update' })
        .expect(403);

      expect(response.body.success).toBe(false);
      
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('DELETE /api/v1/tags/:id', () => {
    it('should delete tag', async () => {
      const tag = await TestFactories.createTag(testUser.id, 'to-delete');

      await request(app)
        .delete(`/api/v1/tags/${tag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(204);

      // Проверяем что тег удален
      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.data.length).toBe(0);
    });

    it('should not allow deleting other user tags', async () => {
      const otherUser = await TestFactories.createUser({
        login: `other_user_${Date.now()}`,
        password: 'TestPassword123!',
      });
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');

      const response = await request(app)
        .delete(`/api/v1/tags/${otherTag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(403);

      expect(response.body.success).toBe(false);
      
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('Tags Validation', () => {
    it('should reject tag name longer than 50 characters', async () => {
      const longName = 'a'.repeat(51);
      
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: longName })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should trim whitespace from tag name', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: '  my-tag  ' })
        .expect(201);

      expect(response.body.data.name).toBe('my-tag'); // Должен быть триммирован
    });
  });
});