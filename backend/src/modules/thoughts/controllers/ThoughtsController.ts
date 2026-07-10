import { Request, Response, NextFunction } from 'express';
import { ThoughtsService } from '../services/ThoughtsService';
import { pool } from '../../../db/pool';

export class ThoughtsController {
  private service: ThoughtsService;
  constructor() { this.service = new ThoughtsService(pool); }

  getThoughts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        search: req.query.search as string,
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getThoughts(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getThoughtById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getThoughtById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createThought = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createThought(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updateThought = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateThought(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deleteThought = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteThought(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };
}

export const thoughtsController = new ThoughtsController();