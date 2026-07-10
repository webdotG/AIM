import request from 'supertest';
import app from '../../../index';
import { TestFactories } from '../../../__tests__/helpers/test-factories';
import { TestHelpers } from '../../../__tests__/helpers/test-helpers';

describe('Graph Module', () => {
  let testUser: any;
  let authToken: string;
  let nodes: Array<{ node: any }> = [];

  beforeEach(async () => {
    testUser = await TestFactories.createUser({
      login: `test_graph_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      password: 'TestPassword123!',
    });
    authToken = TestHelpers.createToken(testUser.id, testUser.login);
  });

  afterEach(async () => {
    await TestFactories.cleanupUser(testUser.id);
  });

  describe('GET /api/v1/graph/node-types', () => {
    it('should return all node types', async () => {
      const response = await request(app)
        .get('/api/v1/graph/node-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(10);

      const codes = response.body.data.map((nt: any) => nt.code);
      expect(codes.includes('dream')).toBe(true);
      expect(codes.includes('thought')).toBe(true);
      expect(codes.includes('person')).toBe(true);
    });
  });

  describe('GET /api/v1/graph/edge-types', () => {
    it('should return all edge types', async () => {
      const response = await request(app)
        .get('/api/v1/graph/edge-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(16);

      const codes = response.body.data.map((et: any) => et.code);
      expect(codes.includes('related_to')).toBe(true);
      expect(codes.includes('mentions')).toBe(true);
      expect(codes.includes('caused')).toBe(true);
    });
  });

  describe('GET /api/v1/graph/nodes', () => {
    beforeEach(async () => {
      nodes.push(await TestFactories.createDream(testUser.id, { title: 'Dream 1' }));
      nodes.push(await TestFactories.createThought(testUser.id, { title: 'Thought 1' }));
      nodes.push(await TestFactories.createMemory(testUser.id, { title: 'Memory 1' }));
    });

    it('should list all nodes for user', async () => {
      const response = await request(app)
        .get('/api/v1/graph/nodes')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by node type', async () => {
      const response = await request(app)
        .get('/api/v1/graph/nodes?node_type_code=dream')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.data.forEach((n: any) => {
        expect(n.node_type_code).toBe('dream');
      });
    });

    it('should search by title', async () => {
      const response = await request(app)
        .get('/api/v1/graph/nodes?search=Dream+1')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.data[0].title).toContain('Dream 1');
    });
  });

  describe('POST /api/v1/graph/nodes', () => {
    it('should create a node', async () => {
      const response = await request(app)
        .post('/api/v1/graph/nodes')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          node_type_code: 'thought',
          title: 'New Thought',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.node_type_code).toBe('thought');
      expect(response.body.data.title).toBe('New Thought');
    });
  });

  describe('GET /api/v1/graph/nodes/:id', () => {
    let node: any;

    beforeEach(async () => {
      node = await TestFactories.createDream(testUser.id, { title: 'Fetchable Dream' });
    });

    it('should get node by id', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/nodes/${node.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(node.node.id);
    });

    it('should return 404 for other user node', async () => {
      const otherUser = await TestFactories.createUser();
      const otherNode = await TestFactories.createDream(otherUser.id);

      const response = await request(app)
        .get(`/api/v1/graph/nodes/${otherNode.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
      await TestFactories.cleanupUser(otherUser.id);
    });
  });

  describe('PATCH /api/v1/graph/nodes/:id', () => {
    let node: any;

    beforeEach(async () => {
      node = await TestFactories.createDream(testUser.id);
    });

    it('should update node title', async () => {
      const response = await request(app)
        .put(`/api/v1/graph/nodes/${node.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/graph/nodes/:id', () => {
    let node: any;

    beforeEach(async () => {
      node = await TestFactories.createDream(testUser.id);
    });

    it('should soft-delete a node', async () => {
      const response = await request(app)
        .delete(`/api/v1/graph/nodes/${node.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/graph/edges', () => {
    let dreamNode: any, thoughtNode: any;

    beforeEach(async () => {
      dreamNode = await TestFactories.createDream(testUser.id, { title: 'Connected Dream' });
      thoughtNode = await TestFactories.createThought(testUser.id, { title: 'Connected Thought' });
    });

    it('should create an edge between two nodes', async () => {
      const response = await request(app)
        .post('/api/v1/graph/edges')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          from_node_id: dreamNode.node.id,
          to_node_id: thoughtNode.node.id,
          edge_type_code: 'related_to',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should reject self-edge', async () => {
      const response = await request(app)
        .post('/api/v1/graph/edges')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          from_node_id: dreamNode.node.id,
          to_node_id: dreamNode.node.id,
          edge_type_code: 'related_to',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/graph/edges/node/:nodeId', () => {
    let dreamNode: any, thoughtNode: any;

    beforeEach(async () => {
      dreamNode = await TestFactories.createDream(testUser.id);
      thoughtNode = await TestFactories.createThought(testUser.id);
      await TestFactories.createEdge(dreamNode.node.id, thoughtNode.node.id, 'related_to');
    });

    it('should get edges for a node', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/edges/node/${dreamNode.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/graph/graph-data', () => {
    it('should get full graph data', async () => {
      await TestFactories.createDream(testUser.id);
      await TestFactories.createThought(testUser.id);

      const response = await request(app)
        .get('/api/v1/graph/graph-data')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nodes');
      expect(response.body.data).toHaveProperty('edges');
    });
  });

  describe('GET /api/v1/graph/neighbors/:nodeId', () => {
    it('should get neighbors for a node', async () => {
      const p1 = await TestFactories.createPerson(testUser.id, { full_name: 'Person A' });
      const p2 = await TestFactories.createPerson(testUser.id, { full_name: 'Person B' });
      await TestFactories.createEdge(p1.node.id, p2.node.id, 'mentions');

      const response = await request(app)
        .get(`/api/v1/graph/neighbors/${p1.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/graph/most-connected', () => {
    it('should get most connected nodes', async () => {
      const center = await TestFactories.createDream(testUser.id);
      for (let i = 0; i < 3; i++) {
        const n = await TestFactories.createThought(testUser.id);
        await TestFactories.createEdge(center.node.id, n.node.id, 'related_to');
      }

      const response = await request(app)
        .get('/api/v1/graph/most-connected?limit=5')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- NEW TEST BLOCKS ---

  describe('DELETE /api/v1/graph/edges/:id', () => {
    let dreamNode: any, thoughtNode: any, edge: any;

    beforeEach(async () => {
      dreamNode = await TestFactories.createDream(testUser.id, { title: 'Edge Delete Dream' });
      thoughtNode = await TestFactories.createThought(testUser.id, { title: 'Edge Delete Thought' });
      edge = await TestFactories.createEdge(dreamNode.node.id, thoughtNode.node.id, 'related_to');
    });

    it('should soft-delete an edge by ID', async () => {
      const response = await request(app)
        .delete(`/api/v1/graph/edges/${edge.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);

      const edgesResponse = await request(app)
        .get(`/api/v1/graph/edges/node/${dreamNode.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(edgesResponse.body.data.data.length).toBe(0);
    });

    it('should return 404 for non-existent edge', async () => {
      const response = await request(app)
        .delete('/api/v1/graph/edges/999999')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/graph/traversal/:nodeId', () => {
    let nodeA: any, nodeB: any, nodeC: any;

    beforeEach(async () => {
      nodeA = await TestFactories.createDream(testUser.id, { title: 'Traversal Node A' });
      nodeB = await TestFactories.createThought(testUser.id, { title: 'Traversal Node B' });
      nodeC = await TestFactories.createMemory(testUser.id, { title: 'Traversal Node C' });
      await TestFactories.createEdge(nodeA.node.id, nodeB.node.id, 'related_to', 0.9);
      await TestFactories.createEdge(nodeB.node.id, nodeC.node.id, 'caused', 0.3);
    });

    it('should traverse the graph from a starting node with default params', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeA.node.id}`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('path');
      expect(response.body.data).toHaveProperty('edges');
    });

    it('should limit traversal depth', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeA.node.id}?depth=1`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by direction', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeB.node.id}?direction=backward`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by node type', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeA.node.id}?filterNodeType=dream`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by edge type', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeA.node.id}?filterEdgeType=caused`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by min confidence', async () => {
      const response = await request(app)
        .get(`/api/v1/graph/traversal/${nodeA.node.id}?minConfidence=0.5`)
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should return 401 when creating a node without auth', async () => {
      await request(app)
        .post('/api/v1/graph/nodes')
        .send({
          node_type_code: 'thought',
          title: 'Unauthenticated Thought',
        })
        .expect(401);
    });

    it('should return 401 when creating an edge without auth', async () => {
      const node1 = await TestFactories.createDream(testUser.id);
      const node2 = await TestFactories.createThought(testUser.id);

      await request(app)
        .post('/api/v1/graph/edges')
        .send({
          from_node_id: node1.node.id,
          to_node_id: node2.node.id,
          edge_type_code: 'related_to',
        })
        .expect(401);
    });

    it('should return 401 when accessing graph-data without auth', async () => {
      await request(app)
        .get('/api/v1/graph/graph-data')
        .expect(401);
    });

    it('should return 401 when accessing most-connected without auth', async () => {
      await request(app)
        .get('/api/v1/graph/most-connected')
        .expect(401);
    });

    it('should return 401 when accessing neighbors without auth', async () => {
      const node = await TestFactories.createDream(testUser.id);

      await request(app)
        .get(`/api/v1/graph/neighbors/${node.node.id}`)
        .expect(401);
    });
  });

  describe('Cross-user edge creation', () => {
    let userA: any, userB: any;
    let nodeA: any, nodeB: any;

    beforeEach(async () => {
      userA = await TestFactories.createUser({
        login: `cross_user_a_${Date.now()}`,
        password: 'TestPassword123!',
      });
      userB = await TestFactories.createUser({
        login: `cross_user_b_${Date.now()}`,
        password: 'TestPassword123!',
      });
      nodeA = await TestFactories.createDream(userA.id, { title: 'User A Node' });
      nodeB = await TestFactories.createThought(userB.id, { title: 'User B Node' });
    });

    afterEach(async () => {
      await TestFactories.cleanupUser(userA.id);
      await TestFactories.cleanupUser(userB.id);
    });

    it('should reject edge from user A node to user B node', async () => {
      const authTokenA = TestHelpers.createToken(userA.id, userA.login);

      const response = await request(app)
        .post('/api/v1/graph/edges')
        .set('Authorization', TestHelpers.authHeader(authTokenA))
        .send({
          from_node_id: nodeA.node.id,
          to_node_id: nodeB.node.id,
          edge_type_code: 'related_to',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject edge from user B node to user A node', async () => {
      const authTokenB = TestHelpers.createToken(userB.id, userB.login);

      const response = await request(app)
        .post('/api/v1/graph/edges')
        .set('Authorization', TestHelpers.authHeader(authTokenB))
        .send({
          from_node_id: nodeB.node.id,
          to_node_id: nodeA.node.id,
          edge_type_code: 'related_to',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Invalid node_type_code', () => {
    it('should return 400 for invalid node type', async () => {
      const response = await request(app)
        .post('/api/v1/graph/nodes')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .send({
          node_type_code: 'invalid_type',
          title: 'Bad Node',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Empty graph-data', () => {
    it('should return empty arrays for a user with no nodes', async () => {
      const response = await request(app)
        .get('/api/v1/graph/graph-data')
        .set('Authorization', TestHelpers.authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nodes).toEqual([]);
      expect(response.body.data.edges).toEqual([]);
    });
  });
});