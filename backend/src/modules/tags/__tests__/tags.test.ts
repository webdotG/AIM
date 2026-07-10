import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Tags Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_tags_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/tags', () => {
    it('should list all user tags', async () => {
      await TestFactories.createTag(testUser.id, 'lucid');
      await TestFactories.createTag(testUser.id, 'recurring');
      await TestFactories.createTag(testUser.id, 'nightmare');

      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(3);

      const names = response.body.data.data.map((t: any) => t.name);
      expect(names.includes('lucid')).toBe(true);
      expect(names.includes('recurring')).toBe(true);
      expect(names.includes('nightmare')).toBe(true);
    });

    it('should return empty array if no tags', async () => {
      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBe(0);
    });

    it('should not show tags from other users', async () => {
      const otherUser = await TestFactories.createUser();
      await TestFactories.createTag(otherUser.id, 'other-tag');
      await TestFactories.createTag(testUser.id, 'my-tag');

      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].name).toBe('my-tag');

      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('POST /api/v1/tags', () => {
    it('should create a tag', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'test-tag' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('test-tag');
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
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'duplicate' })
        .expect(201);

      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'duplicate' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should allow same tag name for different users', async () => {
      const otherUser = await TestFactories.createUser();
      const otherToken = TestHelpers.createToken(otherUser.id, otherUser.login);

      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'shared-tag' })
        .expect(201);

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
    let tagId: number;

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
      const response = await request(app)
        .get('/api/v1/tags/999999')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow access to other user tags', async () => {
      const otherUser = await TestFactories.createUser();
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');

      const response = await request(app)
        .get(`/api/v1/tags/${otherTag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);

      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('PUT /api/v1/tags/:id', () => {
    let tagId: number;

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
      const otherUser = await TestFactories.createUser();
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');

      const response = await request(app)
        .put(`/api/v1/tags/${otherTag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'try-to-update' })
        .expect(404);

      expect(response.body.success).toBe(false);

      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('DELETE /api/v1/tags/:id', () => {
    it('should delete tag', async () => {
      const tag = await TestFactories.createTag(testUser.id, 'to-delete');

      const deleteResponse = await request(app)
        .delete(`/api/v1/tags/${tag.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      const response = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.data.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/tags/most-used', () => {
    it('should return tags ordered by usage count', async () => {
      const tag1 = await TestFactories.createTag(testUser.id, 'frequent');
      const tag2 = await TestFactories.createTag(testUser.id, 'rare');

      const node1 = await TestFactories.createNode(testUser.id);
      const node2 = await TestFactories.createNode(testUser.id);
      const node3 = await TestFactories.createNode(testUser.id);

      await TestFactories.addTagToNode(node1.id, tag1.id);
      await TestFactories.addTagToNode(node2.id, tag1.id);
      await TestFactories.addTagToNode(node3.id, tag1.id);
      await TestFactories.addTagToNode(node1.id, tag2.id);

      const response = await request(app)
        .get('/api/v1/tags/most-used')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.data[0].name).toBe('frequent');
      expect(Number(response.body.data.data[0].usage_count)).toBe(3);
      expect(response.body.data.data[1].name).toBe('rare');
      expect(Number(response.body.data.data[1].usage_count)).toBe(1);
    });

    it('should respect limit query parameter', async () => {
      const tag1 = await TestFactories.createTag(testUser.id, 'first');
      const tag2 = await TestFactories.createTag(testUser.id, 'second');
      const tag3 = await TestFactories.createTag(testUser.id, 'third');

      const node1 = await TestFactories.createNode(testUser.id);
      const node2 = await TestFactories.createNode(testUser.id);
      const node3 = await TestFactories.createNode(testUser.id);

      await TestFactories.addTagToNode(node1.id, tag1.id);
      await TestFactories.addTagToNode(node2.id, tag1.id);
      await TestFactories.addTagToNode(node1.id, tag2.id);
      await TestFactories.addTagToNode(node3.id, tag3.id);

      const response = await request(app)
        .get('/api/v1/tags/most-used?limit=2')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
    });

    it('should return empty array when no tags are used', async () => {
      await TestFactories.createTag(testUser.id, 'unused-tag');

      const response = await request(app)
        .get('/api/v1/tags/most-used')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/tags/unused', () => {
    it('should return tags not attached to any node', async () => {
      await TestFactories.createTag(testUser.id, 'unused-one');
      await TestFactories.createTag(testUser.id, 'unused-two');

      const response = await request(app)
        .get('/api/v1/tags/unused')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);

      const names = response.body.data.data.map((t: any) => t.name);
      expect(names.includes('unused-one')).toBe(true);
      expect(names.includes('unused-two')).toBe(true);
    });

    it('should remove tag from unused list once attached to a node', async () => {
      const tag1 = await TestFactories.createTag(testUser.id, 'was-unused');
      await TestFactories.createTag(testUser.id, 'still-unused');

      const node = await TestFactories.createNode(testUser.id);
      await TestFactories.addTagToNode(node.id, tag1.id);

      const response = await request(app)
        .get('/api/v1/tags/unused')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].name).toBe('still-unused');
    });

    it('should return empty array when all tags are used', async () => {
      const tag = await TestFactories.createTag(testUser.id, 'used-tag');

      const node = await TestFactories.createNode(testUser.id);
      await TestFactories.addTagToNode(node.id, tag.id);

      const response = await request(app)
        .get('/api/v1/tags/unused')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(0);
    });
  });

  describe('POST /api/v1/tags/find-or-create', () => {
    it('should create a new tag when name does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/tags/find-or-create')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'new-tag' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.name).toBe('new-tag');
      expect(response.body.data.data).toHaveProperty('id');

      const listResponse = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(listResponse.body.data.data.length).toBe(1);
      expect(listResponse.body.data.data[0].name).toBe('new-tag');
    });

    it('should return existing tag when name already exists', async () => {
      const originalTag = await TestFactories.createTag(testUser.id, 'existing-tag');

      const response = await request(app)
        .post('/api/v1/tags/find-or-create')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'existing-tag' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.id).toBe(originalTag.id);
      expect(response.body.data.data.name).toBe('existing-tag');

      const listResponse = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(listResponse.body.data.data.length).toBe(1);
    });

    it('should match tag name case-insensitively', async () => {
      await TestFactories.createTag(testUser.id, 'CaseTag');

      const response = await request(app)
        .post('/api/v1/tags/find-or-create')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ name: 'casetag' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.name).toBe('CaseTag');
    });
  });

  describe('GET /api/v1/tags/:id/nodes', () => {
    it('should return nodes associated with a tag', async () => {
      const tag = await TestFactories.createTag(testUser.id, 'test-tag');

      const node1 = await TestFactories.createNode(testUser.id, 'conversation', 'Node One');
      const node2 = await TestFactories.createNode(testUser.id, 'dream', 'Node Two');

      await TestFactories.addTagToNode(node1.id, tag.id);
      await TestFactories.addTagToNode(node2.id, tag.id);

      const response = await request(app)
        .get(`/api/v1/tags/${tag.id}/nodes`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);

      const titles = response.body.data.map((n: any) => n.title);
      expect(titles.includes('Node One')).toBe(true);
      expect(titles.includes('Node Two')).toBe(true);
    });

    it('should return empty array when tag has no nodes', async () => {
      const tag = await TestFactories.createTag(testUser.id, 'no-nodes');

      const response = await request(app)
        .get(`/api/v1/tags/${tag.id}/nodes`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should not allow access to nodes from other user tags', async () => {
      const otherUser = await TestFactories.createUser();
      const otherTag = await TestFactories.createTag(otherUser.id, 'other-tag');
      const otherNode = await TestFactories.createNode(otherUser.id);
      await TestFactories.addTagToNode(otherNode.id, otherTag.id);

      const response = await request(app)
        .get(`/api/v1/tags/${otherTag.id}/nodes`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);

      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('GET /api/v1/tags/node/:nodeId', () => {
    it('should return tags for a specific node', async () => {
      const node = await TestFactories.createNode(testUser.id);

      const tag1 = await TestFactories.createTag(testUser.id, 'tag-a');
      const tag2 = await TestFactories.createTag(testUser.id, 'tag-b');

      await TestFactories.addTagToNode(node.id, tag1.id);
      await TestFactories.addTagToNode(node.id, tag2.id);

      const response = await request(app)
        .get(`/api/v1/tags/node/${node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);

      const names = response.body.data.map((t: any) => t.name);
      expect(names.includes('tag-a')).toBe(true);
      expect(names.includes('tag-b')).toBe(true);
    });

    it('should return empty array when node has no tags', async () => {
      const node = await TestFactories.createNode(testUser.id);

      const response = await request(app)
        .get(`/api/v1/tags/node/${node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('PUT /api/v1/tags/node/:nodeId', () => {
    it('should replace all tags for a node', async () => {
      const node = await TestFactories.createNode(testUser.id);

      const oldTag1 = await TestFactories.createTag(testUser.id, 'old-tag-1');
      const oldTag2 = await TestFactories.createTag(testUser.id, 'old-tag-2');
      const newTag1 = await TestFactories.createTag(testUser.id, 'new-tag-1');
      const newTag2 = await TestFactories.createTag(testUser.id, 'new-tag-2');

      await TestFactories.addTagToNode(node.id, oldTag1.id);
      await TestFactories.addTagToNode(node.id, oldTag2.id);

      const response = await request(app)
        .put(`/api/v1/tags/node/${node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ tag_ids: [newTag1.id, newTag2.id] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);

      const names = response.body.data.map((t: any) => t.name);
      expect(names.includes('new-tag-1')).toBe(true);
      expect(names.includes('new-tag-2')).toBe(true);
      expect(names.includes('old-tag-1')).toBe(false);
      expect(names.includes('old-tag-2')).toBe(false);
    });

    it('should remove all tags when sending empty array', async () => {
      const node = await TestFactories.createNode(testUser.id);
      const tag = await TestFactories.createTag(testUser.id, 'will-remove');
      await TestFactories.addTagToNode(node.id, tag.id);

      const response = await request(app)
        .put(`/api/v1/tags/node/${node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ tag_ids: [] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);

      const verifyResponse = await request(app)
        .get(`/api/v1/tags/node/${node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(verifyResponse.body.data.length).toBe(0);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when accessing tags without auth', async () => {
      const response = await request(app)
        .get('/api/v1/tags')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});