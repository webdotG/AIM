"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphController = exports.GraphController = void 0;
const GraphService_1 = require("../services/GraphService");
const pool_1 = require("../../../db/pool");
class GraphController {
    constructor() {
        // NODES
        this.getNodes = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    node_type_code: req.query.node_type_code,
                    search: req.query.search,
                    from_date: req.query.from,
                    to_date: req.query.to,
                };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getNodes(userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNodeById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const node = await this.service.getNodeById(id, userId);
                res.status(200).json({ success: true, data: node });
            }
            catch (error) {
                next(error);
            }
        };
        this.createNode = async (req, res, next) => {
            try {
                const userId = req.userId;
                const { node_type_code, title } = req.body;
                const node = await this.service.createNode(userId, node_type_code, title);
                res.status(201).json({ success: true, data: node });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateNode = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const updates = req.body;
                const node = await this.service.updateNode(id, userId, updates);
                res.status(200).json({ success: true, data: node });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteNode = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                await this.service.deleteNode(id, userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        // EDGES
        this.createEdge = async (req, res, next) => {
            try {
                const userId = req.userId;
                const { from_node_id, to_node_id, edge_type_code, confidence, weight, notes } = req.body;
                const edge = await this.service.createEdge(userId, {
                    from_node_id,
                    to_node_id,
                    edge_type_code,
                    confidence,
                    weight,
                    notes,
                });
                res.status(201).json({ success: true, data: edge });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEdgesForNode = async (req, res, next) => {
            try {
                const { nodeId } = req.params;
                const userId = req.userId;
                const direction = req.query.direction || 'both';
                // Validate direction
                if (!['outgoing', 'incoming', 'both'].includes(direction)) {
                    return res.status(400).json({ success: false, error: 'Invalid direction. Must be outgoing, incoming, or both.' });
                }
                const edges = await this.service.getEdgesForNode(nodeId, userId, direction);
                res.status(200).json({ success: true, data: edges });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteEdge = async (req, res, next) => {
            try {
                const edgeId = parseInt(req.params.id);
                await this.service.deleteEdge(edgeId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        // TRAVERSAL
        this.traverseGraph = async (req, res, next) => {
            try {
                const { nodeId } = req.params;
                const userId = req.userId;
                const options = {
                    direction: req.query.direction,
                    depth: req.query.depth ? parseInt(req.query.depth) : undefined,
                    filterNodeType: req.query.filterNodeType,
                    filterEdgeType: req.query.filterEdgeType,
                    minConfidence: req.query.minConfidence ? parseFloat(req.query.minConfidence) : undefined,
                };
                // Validate direction
                if (options.direction && !['forward', 'backward', 'both'].includes(options.direction)) {
                    return res.status(400).json({ success: false, error: 'Invalid direction. Must be forward, backward, or both.' });
                }
                const result = await this.service.traverseGraph(nodeId, userId, options);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNeighbors = async (req, res, next) => {
            try {
                const { nodeId } = req.params;
                const userId = req.userId;
                const neighbors = await this.service.getNeighbors(nodeId, userId);
                res.status(200).json({ success: true, data: neighbors });
            }
            catch (error) {
                next(error);
            }
        };
        this.getGraphData = async (req, res, next) => {
            try {
                const userId = req.userId;
                const result = await this.service.getGraphData(userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMostConnected = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.service.getMostConnected(userId, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        // REFERENCE DATA
        this.getNodeTypes = async (req, res, next) => {
            try {
                const types = await this.service.getNodeTypes();
                res.status(200).json({ success: true, data: types });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEdgeTypes = async (req, res, next) => {
            try {
                const types = await this.service.getEdgeTypes();
                res.status(200).json({ success: true, data: types });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new GraphService_1.GraphService(pool_1.pool);
    }
}
exports.GraphController = GraphController;
exports.graphController = new GraphController();
//# sourceMappingURL=GraphController.js.map