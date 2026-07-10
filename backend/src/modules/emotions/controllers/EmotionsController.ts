import { Request, Response, NextFunction } from 'express';
import { EmotionsService } from '../services/EmotionsService';
import { pool } from '../../../db/pool';

export class EmotionsController {
  private service: EmotionsService;
  constructor() { this.service = new EmotionsService(pool); }

  // Public
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emotions = await this.service.getAllEmotions();
      res.status(200).json({ success: true, data: emotions });
    } catch (error) { next(error); }
  };

  getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emotions = await this.service.getByCategory(req.params.category);
      res.status(200).json({ success: true, data: emotions });
    } catch (error) { next(error); }
  };

  // Auth required
  getEmotionsForNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emotions = await this.service.getEmotionsForNode(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: emotions });
    } catch (error) { next(error); }
  };

  replaceEmotionsForNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.replaceEmotionsForNode(req.params.nodeId, req.userId!, req.body.emotions);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  removeEmotionsFromNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.removeEmotionsFromNode(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getStats(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getMostFrequent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.service.getMostFrequent(req.userId!, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const granularity = req.query.granularity as 'day' | 'week' | 'month' || 'day';
      const result = await this.service.getDistribution(req.userId!, granularity);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const emotionsController = new EmotionsController();