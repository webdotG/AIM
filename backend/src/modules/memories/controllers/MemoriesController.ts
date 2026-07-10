import { Request, Response, NextFunction } from 'express';
import { MemoriesService } from '../services/MemoriesService';
import { pool } from '../../../db/pool';

export class MemoriesController {
  private service: MemoriesService;
  constructor() { this.service = new MemoriesService(pool); }

  getMemories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        search: req.query.search as string,
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getMemories(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getMemoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getMemoryById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createMemory(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updateMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateMemory(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deleteMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteMemory(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };
}

export const memoriesController = new MemoriesController();