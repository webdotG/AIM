"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const NodesRepository_1 = require("../repositories/NodesRepository");
const EdgesRepository_1 = require("../repositories/EdgesRepository");
const TraversalRepository_1 = require("../repositories/TraversalRepository");
const NodeTypesRepository_1 = require("../repositories/NodeTypesRepository");
const EdgeTypesRepository_1 = require("../repositories/EdgeTypesRepository");
const AppError_1 = require("../../../shared/errors/AppError");
const types_1 = require("../../../shared/types");
class GraphService {
    constructor(pool) {
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.edgesRepo = new EdgesRepository_1.EdgesRepository(pool);
        this.traversalRepo = new TraversalRepository_1.TraversalRepository(pool);
        this.nodeTypesRepo = new NodeTypesRepository_1.NodeTypesRepository(pool);
        this.edgeTypesRepo = new EdgeTypesRepository_1.EdgeTypesRepository(pool);
    }
    // NODES
    async getNodes(userId, filters = {}, page = 1, limit = 50) {
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
    async getNodeById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return node;
    }
    async createNode(userId, nodeTypeCode, title = null) {
        if (!types_1.VALID_NODE_TYPES.includes(nodeTypeCode)) {
            throw new AppError_1.ValidationError(`Invalid node type: ${nodeTypeCode}`);
        }
        const node = await this.nodesRepo.create(userId, nodeTypeCode, title);
        if (!node) {
            throw new AppError_1.ValidationError(`Node type "${nodeTypeCode}" not found`);
        }
        return node;
    }
    async updateNode(nodeId, userId, updates) {
        await this.getNodeById(nodeId, userId);
        if (updates.title !== undefined) {
            const node = await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            if (!node) {
                throw new AppError_1.NotFoundError('Node not found');
            }
            return node;
        }
        return this.getNodeById(nodeId, userId);
    }
    async deleteNode(nodeId, userId) {
        await this.getNodeById(nodeId, userId);
        const result = await this.nodesRepo.softDelete(nodeId, userId);
        if (!result) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return { success: true };
    }
    // EDGES
    async createEdge(userId, input) {
        if (input.from_node_id === input.to_node_id) {
            throw new AppError_1.ValidationError('Edge cannot connect a node to itself');
        }
        if (!await this.nodesRepo.belongsToUser(input.from_node_id, userId)) {
            throw new AppError_1.NotFoundError('Source node not found');
        }
        if (!await this.nodesRepo.belongsToUser(input.to_node_id, userId)) {
            throw new AppError_1.NotFoundError('Target node not found');
        }
        return this.edgesRepo.create(input.from_node_id, input.to_node_id, input.edge_type_code, input.confidence ?? null, input.weight ?? null, input.notes ?? null);
    }
    async getEdgesForNode(nodeId, userId, direction = 'both') {
        await this.getNodeById(nodeId, userId);
        const edges = await this.edgesRepo.findByNode(nodeId, direction);
        return {
            data: edges,
            pagination: { page: 1, limit: edges.length, total: edges.length, totalPages: 1 },
        };
    }
    async deleteEdge(edgeId) {
        const result = await this.edgesRepo.softDelete(edgeId);
        if (!result) {
            throw new AppError_1.NotFoundError('Edge not found');
        }
        return { success: true };
    }
    // TRAVERSAL
    async traverseGraph(startNodeId, userId, options = {}) {
        await this.getNodeById(startNodeId, userId);
        return this.traversalRepo.traverse(startNodeId, userId, options);
    }
    async getNeighbors(nodeId, userId) {
        await this.getNodeById(nodeId, userId);
        return this.traversalRepo.getNeighbors(nodeId, userId);
    }
    async getGraphData(userId) {
        return this.edgesRepo.getGraphData(userId);
    }
    async getMostConnected(userId, limit = 10) {
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
exports.GraphService = GraphService;
//# sourceMappingURL=GraphService.js.map