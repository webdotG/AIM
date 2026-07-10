import { NodesRepository } from '../repositories/NodesRepository';
import { EdgesRepository } from '../repositories/EdgesRepository';
import { TraversalRepository } from '../repositories/TraversalRepository';
import { NodeTypesRepository } from '../repositories/NodeTypesRepository';
import { EdgeTypesRepository } from '../repositories/EdgeTypesRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { VALID_NODE_TYPES } from '../../../shared/types';

export class GraphService {
  private nodesRepo: NodesRepository;
  private edgesRepo: EdgesRepository;
  private traversalRepo: TraversalRepository;
  private nodeTypesRepo: NodeTypesRepository;
  private edgeTypesRepo: EdgeTypesRepository;

  constructor(pool: any) {
    this.nodesRepo = new NodesRepository(pool);
    this.edgesRepo = new EdgesRepository(pool);
    this.traversalRepo = new TraversalRepository(pool);
    this.nodeTypesRepo = new NodeTypesRepository(pool);
    this.edgeTypesRepo = new EdgeTypesRepository(pool);
  }

  // NODES

  async getNodes(userId: number, filters: { node_type_code?: string; search?: string; from_date?: string; to_date?: string } = {}, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    const nodes = await this.nodesRepo.findByUserId(userId, filters, { limit, offset });
    const total = await this.nodesRepo.countByUserId(userId, filters);

    return {
      data: nodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNodeById(nodeId: string, userId: number) {
    const node = await this.nodesRepo.findById(nodeId, userId);
    if (!node) {
      throw new NotFoundError('Node not found');
    }
    return node;
  }

  async createNode(userId: number, nodeTypeCode: string, title: string | null = null) {
    if (!VALID_NODE_TYPES.includes(nodeTypeCode as any)) {
      throw new ValidationError(`Invalid node type: ${nodeTypeCode}`);
    }

    const node = await this.nodesRepo.create(userId, nodeTypeCode, title);
    if (!node) {
      throw new ValidationError(`Node type "${nodeTypeCode}" not found`);
    }
    return node;
  }

  async updateNode(nodeId: string, userId: number, updates: { title?: string | null }) {
    await this.getNodeById(nodeId, userId);

    if (updates.title !== undefined) {
      const node = await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
      if (!node) {
        throw new NotFoundError('Node not found');
      }
      return node;
    }
    return this.getNodeById(nodeId, userId);
  }

  async deleteNode(nodeId: string, userId: number) {
    await this.getNodeById(nodeId, userId);
    const result = await this.nodesRepo.softDelete(nodeId, userId);
    if (!result) {
      throw new NotFoundError('Node not found');
    }
    return { success: true };
  }

  // EDGES

  async createEdge(userId: number, input: { from_node_id: string; to_node_id: string; edge_type_code: string; confidence?: number; weight?: number; notes?: string }) {
    if (input.from_node_id === input.to_node_id) {
      throw new ValidationError('Edge cannot connect a node to itself');
    }

    if (!await this.nodesRepo.belongsToUser(input.from_node_id, userId)) {
      throw new NotFoundError('Source node not found');
    }
    if (!await this.nodesRepo.belongsToUser(input.to_node_id, userId)) {
      throw new NotFoundError('Target node not found');
    }

    return this.edgesRepo.create(
      input.from_node_id,
      input.to_node_id,
      input.edge_type_code,
      input.confidence ?? null,
      input.weight ?? null,
      input.notes ?? null
    );
  }

  async getEdgesForNode(nodeId: string, userId: number, direction: 'outgoing' | 'incoming' | 'both' = 'both') {
    await this.getNodeById(nodeId, userId);
    const edges = await this.edgesRepo.findByNode(nodeId, direction);
    return {
      data: edges,
      pagination: { page: 1, limit: edges.length, total: edges.length, totalPages: 1 },
    };
  }

  async deleteEdge(edgeId: number) {
    const result = await this.edgesRepo.softDelete(edgeId);
    if (!result) {
      throw new NotFoundError('Edge not found');
    }
    return { success: true };
  }

  // TRAVERSAL

  async traverseGraph(startNodeId: string, userId: number, options: { direction?: 'forward' | 'backward' | 'both'; depth?: number; filterNodeType?: string; filterEdgeType?: string; minConfidence?: number } = {}) {
    await this.getNodeById(startNodeId, userId);
    return this.traversalRepo.traverse(startNodeId, userId, options);
  }

  async getNeighbors(nodeId: string, userId: number) {
    await this.getNodeById(nodeId, userId);
    return this.traversalRepo.getNeighbors(nodeId, userId);
  }

  async getGraphData(userId: number) {
    return this.edgesRepo.getGraphData(userId);
  }

  async getMostConnected(userId: number, limit: number = 10) {
    const rows = await this.edgesRepo.getMostConnected(userId, limit);
    return {
      data: rows,
      pagination: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 },
    };
  }

  // REFERENCE DATA

  async getNodeTypes() {
    return this.nodeTypesRepo.findAll();
  }

  async getEdgeTypes() {
    return this.edgeTypesRepo.findAll();
  }
}