import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('People Module', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_people_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/people', () => {
    it('should list all people for user', async () => {
      const p1 = await TestFactories.createPerson(testUser.id, { full_name: 'John Doe', relationship: 'Friend' });
      const p2 = await TestFactories.createPerson(testUser.id, { full_name: 'Jane Smith', relationship: 'Sister' });

      const response = await request(app)
        .get('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      const names = response.body.data.map((p: any) => p.full_name);
      expect(names.includes('John Doe')).toBe(true);
      expect(names.includes('Jane Smith')).toBe(true);
    });

    it('should return empty array if no people', async () => {
      const response = await request(app)
        .get('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search by name', async () => {
      await TestFactories.createPerson(testUser.id, { full_name: 'Alice Wonder' });
      await TestFactories.createPerson(testUser.id, { full_name: 'Bob Builder' });

      const response = await request(app)
        .get('/api/v1/people?search=Alice')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].full_name).toContain('Alice');
    });
  });

  describe('GET /api/v1/people/:id', () => {
    let personNode: any;

    beforeEach(async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Test Person' });
      personNode = person.node;
    });

    it('should get person by node id', async () => {
      const response = await request(app)
        .get(`/api/v1/people/${personNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.node.id).toBe(personNode.id);
    });

    it('should return 404 for non-existent person', async () => {
      const response = await request(app)
        .get('/api/v1/people/00000000-0000-0000-0000-000000000000')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow access to other user people', async () => {
      const otherUser = await TestFactories.createUser();
      const otherPerson = await TestFactories.createPerson(otherUser.id, { full_name: 'Other User Person' });

      const response = await request(app)
        .get(`/api/v1/people/${otherPerson.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('POST /api/v1/people', () => {
    it('should create a person', async () => {
      const response = await request(app)
        .post('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          full_name: 'Test Person',
          relationship: 'Friend',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('node');
      expect(response.body.data.node.node_type_code).toBe('person');
    });

    it('should reject missing full_name', async () => {
      const response = await request(app)
        .post('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/people/:id', () => {
    let personNode: any;

    beforeEach(async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Old Name' });
      personNode = person.node;
    });

    it('should update person', async () => {
      const response = await request(app)
        .put(`/api/v1/people/${personNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          full_name: 'Updated Name',
          relationship: 'Updated Relationship',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/people/:id', () => {
    let personNode: any;

    beforeEach(async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'To Delete' });
      personNode = person.node;
    });

    it('should soft-delete person', async () => {
      const deleteResponse = await request(app)
        .delete(`/api/v1/people/${personNode.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      const listResponse = await request(app)
        .get('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      const found = listResponse.body.data.find(
        (p: any) => p.node.id === personNode.id
      );
      expect(found).toBeUndefined();
    });
  });

  describe('GET /api/v1/people/:id/contacts', () => {
    it('should get contacts for a person', async () => {
      const p1 = await TestFactories.createPerson(testUser.id, { full_name: 'Person A' });
      const p2 = await TestFactories.createPerson(testUser.id, { full_name: 'Person B' });

      await TestFactories.createEdge(p1.node.id, p2.node.id, 'related_to');

      const response = await request(app)
        .get(`/api/v1/people/${p1.node.id}/contacts`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/people/most-mentioned', () => {
    it('should return the most mentioned person', async () => {
      const target = await TestFactories.createPerson(testUser.id, { full_name: 'Most Mentioned' });
      const p2 = await TestFactories.createPerson(testUser.id, { full_name: 'Less Mentioned' });
      const p3 = await TestFactories.createPerson(testUser.id, { full_name: 'Also Mentioned' });

      await TestFactories.createEdge(p2.node.id, target.node.id, 'related_to');
      await TestFactories.createEdge(p3.node.id, target.node.id, 'related_to');

      const response = await request(app)
        .get('/api/v1/people/most-mentioned')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].full_name).toBe('Most Mentioned');
    });

    it('should respect limit query param', async () => {
      const target1 = await TestFactories.createPerson(testUser.id, { full_name: 'Target One' });
      const target2 = await TestFactories.createPerson(testUser.id, { full_name: 'Target Two' });
      const p3 = await TestFactories.createPerson(testUser.id, { full_name: 'Source Three' });
      const p4 = await TestFactories.createPerson(testUser.id, { full_name: 'Source Four' });

      await TestFactories.createEdge(p3.node.id, target1.node.id, 'related_to');
      await TestFactories.createEdge(p4.node.id, target1.node.id, 'related_to');
      await TestFactories.createEdge(p3.node.id, target2.node.id, 'related_to');

      const response = await request(app)
        .get('/api/v1/people/most-mentioned?limit=1')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Authentication', () => {
    it('should return 401 on GET /api/v1/people without token', async () => {
      await request(app)
        .get('/api/v1/people')
        .expect(401);
    });

    it('should return 401 on GET /api/v1/people/:id without token', async () => {
      await request(app)
        .get('/api/v1/people/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return 401 on POST /api/v1/people without token', async () => {
      await request(app)
        .post('/api/v1/people')
        .send({ full_name: 'No Auth Person' })
        .expect(401);
    });

    it('should return 401 on PUT /api/v1/people/:id without token', async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Auth Test' });
      await request(app)
        .put(`/api/v1/people/${person.node.id}`)
        .send({ full_name: 'Updated' })
        .expect(401);
    });

    it('should return 401 on DELETE /api/v1/people/:id without token', async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Auth Test' });
      await request(app)
        .delete(`/api/v1/people/${person.node.id}`)
        .expect(401);
    });

    it('should return 401 on GET /api/v1/people/:id/contacts without token', async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Auth Test' });
      await request(app)
        .get(`/api/v1/people/${person.node.id}/contacts`)
        .expect(401);
    });

    it('should return 401 on GET /api/v1/people/most-mentioned without token', async () => {
      await request(app)
        .get('/api/v1/people/most-mentioned')
        .expect(401);
    });
  });

  describe('Cross-user PUT/DELETE', () => {
    it('should return 404 when trying to update another user person', async () => {
      const otherUser = await TestFactories.createUser();
      const otherPerson = await TestFactories.createPerson(otherUser.id, { full_name: 'Other Person' });

      const response = await request(app)
        .put(`/api/v1/people/${otherPerson.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ full_name: 'Hacked Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });

    it('should return 404 when trying to delete another user person', async () => {
      const otherUser = await TestFactories.createUser();
      const otherPerson = await TestFactories.createPerson(otherUser.id, { full_name: 'Other Person' });

      const response = await request(app)
        .delete(`/api/v1/people/${otherPerson.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('Cross-user contacts', () => {
    it('should return 404 when trying to get contacts for another user person', async () => {
      const otherUser = await TestFactories.createUser();
      const otherPerson = await TestFactories.createPerson(otherUser.id, { full_name: 'Other Person' });

      const response = await request(app)
        .get(`/api/v1/people/${otherPerson.node.id}/contacts`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('Query params on list', () => {
    it('should filter by relationship', async () => {
      await TestFactories.createPerson(testUser.id, { full_name: 'Family Member', relationship: 'family' });
      await TestFactories.createPerson(testUser.id, { full_name: 'My Friend', relationship: 'friend' });
      await TestFactories.createPerson(testUser.id, { full_name: 'Another Family', relationship: 'family' });

      const response = await request(app)
        .get('/api/v1/people?relationship=family')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      response.body.data.forEach((p: any) => {
        expect(p.relationship.toLowerCase()).toBe('family');
      });
    });
  });

  describe('Empty contacts', () => {
    it('should return empty array for person with no edges', async () => {
      const person = await TestFactories.createPerson(testUser.id, { full_name: 'Isolated Person' });

      const response = await request(app)
        .get(`/api/v1/people/${person.node.id}/contacts`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Invalid relationship', () => {
    it('should succeed creating a person with an unexpected relationship value', async () => {
      const response = await request(app)
        .post('/api/v1/people')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          full_name: 'Unusual Person',
          relationship: 'Astronaut Walnut',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.node.node_type_code).toBe('person');
    });
  });
});