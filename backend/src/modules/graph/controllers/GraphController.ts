import { Request, Response, NextFunction } from 'express';
import { GraphService } from '../services/GraphService';
import { pool } from '../../../db/pool';

export class GraphController {
  private service: GraphService;

  constructor() {
    this.service = new GraphService(pool);
  }

  // NODES

  getNodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        node_type_code: req.query.node_type_code as string,
        search: req.query.search as string,
        from_date: req.query.from as string,
        to_date: req.query.to as string,
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.service.getNodes(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getNodeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const node = await this.service.getNodeById(id, userId);
      res.status(200).json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  };

  createNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { node_type_code, title } = req.body;

      const node = await this.service.createNode(userId, node_type_code, title);
      res.status(201).json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  };

  updateNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const updates = req.body;

      const node = await this.service.updateNode(id, userId, updates);
      res.status(200).json({ success: true, data: node });
    } catch (error) {
      next(error);
    }
  };

  deleteNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await this.service.deleteNode(id, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  // EDGES

  createEdge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
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
    } catch (error) {
      next(error);
    }
  };

  getEdgesForNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nodeId } = req.params;
      const userId = req.userId!;
      const direction = req.query.direction as 'outgoing' | 'incoming' | 'both' || 'both';

      // Validate direction
      if (!['outgoing', 'incoming', 'both'].includes(direction)) {
        return res.status(400).json({ success: false, error: 'Invalid direction. Must be outgoing, incoming, or both.' });
      }

      const edges = await this.service.getEdgesForNode(nodeId, userId, direction);
      res.status(200).json({ success: true, data: edges });
    } catch (error) {
      next(error);
    }
  };

  deleteEdge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const edgeId = parseInt(req.params.id);
      await this.service.deleteEdge(edgeId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  // TRAVERSAL

  traverseGraph = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nodeId } = req.params;
      const userId = req.userId!;
      const options = {
        direction: req.query.direction as 'forward' | 'backward' | 'both',
        depth: req.query.depth ? parseInt(req.query.depth as string) : undefined,
        filterNodeType: req.query.filterNodeType as string,
        filterEdgeType: req.query.filterEdgeType as string,
        minConfidence: req.query.minConfidence ? parseFloat(req.query.minConfidence as string) : undefined,
      };

      // Validate direction
      if (options.direction && !['forward', 'backward', 'both'].includes(options.direction)) {
        return res.status(400).json({ success: false, error: 'Invalid direction. Must be forward, backward, or both.' });
      }

      const result = await this.service.traverseGraph(nodeId, userId, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getNeighbors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nodeId } = req.params;
      const userId = req.userId!;

      const neighbors = await this.service.getNeighbors(nodeId, userId);
      res.status(200).json({ success: true, data: neighbors });
    } catch (error) {
      next(error);
    }
  };

  getGraphData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const result = await this.service.getGraphData(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getMostConnected = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.service.getMostConnected(userId, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // REFERENCE DATA

  getNodeTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await this.service.getNodeTypes();
      res.status(200).json({ success: true, data: types });
    } catch (error) {
      next(error);
    }
  };

  getEdgeTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await this.service.getEdgeTypes();
      res.status(200).json({ success: true, data: types });
    } catch (error) {
      next(error);
    }
  };
}

export const graphController = new GraphController();