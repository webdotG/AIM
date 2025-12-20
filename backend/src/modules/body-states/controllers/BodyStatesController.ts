import { Request, Response, NextFunction } from 'express';
import { BodyStatesService } from '../services/BodyStatesService';
import { BodyStatesRepository } from '../repositories/BodyStatesRepository';
import { pool } from '../../../db/pool';

export class BodyStatesController {
  private bodyStatesService: BodyStatesService;

  constructor() {
    const bodyStatesRepository = new BodyStatesRepository(pool);
    this.bodyStatesService = new BodyStatesService(bodyStatesRepository);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        has_location: req.query.has_location === 'true' ? true : req.query.has_location === 'false' ? false : undefined,
        circumstance_id: req.query.circumstance_id ? parseInt(req.query.circumstance_id as string) : undefined,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 50)
      };

      const result = await this.bodyStatesService.getAllBodyStates(userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const bodyState = await this.bodyStatesService.getBodyStateById(id, userId);

      res.status(200).json({
        success: true,
        data: bodyState
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const bodyStateData = req.body;

      const bodyState = await this.bodyStatesService.createBodyState(bodyStateData, userId);

      res.status(201).json({
        success: true,
        data: bodyState
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;
      const updates = req.body;

      const bodyState = await this.bodyStatesService.updateBodyState(id, updates, userId);

      res.status(200).json({
        success: true,
        data: bodyState
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const result = await this.bodyStatesService.deleteBodyState(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const bodyStatesController = new BodyStatesController();
