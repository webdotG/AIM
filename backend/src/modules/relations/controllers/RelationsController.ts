import { Request, Response, NextFunction } from 'express';
import { RelationsService } from '../services/RelationsService';
import { RelationsRepository } from '../repositories/RelationsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { pool } from '../../../db/pool';

export class RelationsController {
  private relationsService: RelationsService;

  constructor() {
    const relationsRepository = new RelationsRepository(pool);
    const entriesRepository = new EntriesRepository(pool);
    this.relationsService = new RelationsService(relationsRepository, entriesRepository);
  }

  // GET /api/v1/relations/entry/:entryId - связи для записи
  getForEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;

      const relations = await this.relationsService.getForEntry(entryId, userId);

      res.status(200).json({
        success: true,
        data: relations
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/relations - создать связь
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const relationData = req.body;

      const relation = await this.relationsService.createRelation(relationData, userId);

      res.status(201).json({
        success: true,
        data: relation,
        warning: relation.has_cycle ? 'Cycle detected in the graph' : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/relations/:id - удалить связь
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const relationId = parseInt(req.params.id);
      const userId = req.userId!;

      const result = await this.relationsService.deleteRelation(relationId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/relations/chain/:entryId - цепочка связей (граф)
  getChain = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;
      const depth = parseInt(req.query.depth as string) || 10;
      const direction = (req.query.direction as 'forward' | 'backward' | 'both') || 'both';

      const chain = await this.relationsService.getChain(entryId, userId, depth, direction);

      res.status(200).json({
        success: true,
        data: chain
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/relations/types - типы связей
  getTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await this.relationsService.getRelationTypes();

      res.status(200).json({
        success: true,
        data: types
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/relations/most-connected - самые связанные записи
  getMostConnected = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;

      const entries = await this.relationsService.getMostConnected(userId, limit);

      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/relations/graph - данные для визуализации графа
  getGraph = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const entryId = req.query.entryId as string | undefined;

      const graphData = await this.relationsService.getGraphData(userId, entryId);

      res.status(200).json({
        success: true,
        data: graphData
      });
    } catch (error) {
      next(error);
    }
  };
}

export const relationsController = new RelationsController();