import { Request, Response, NextFunction } from 'express';
import { DreamsService } from '../services/DreamsService';
import { pool } from '../../../db/pool';

export class DreamsController {
  private service: DreamsService;
  constructor() { this.service = new DreamsService(pool); }

  getDreams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        nightmare: req.query.nightmare === 'true',
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getDreams(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getDreamById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getDreamById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createDream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createDream(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updateDream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateDream(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deleteDream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteDream(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };
}

export const dreamsController = new DreamsController();