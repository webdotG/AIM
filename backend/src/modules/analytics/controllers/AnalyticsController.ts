import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { pool } from '../../../db/pool';

export class AnalyticsController {
  private service: AnalyticsService;
  constructor() { this.service = new AnalyticsService(pool); }

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getOverallStats(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getEntriesByMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const result = await this.service.getEntriesByMonth(req.userId!, months);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getEmotionDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getEmotionDistribution(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getActivityHeatmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const result = await this.service.getActivityHeatmap(req.userId!, year);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getStreaks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getStreaks(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getEmotionTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const granularity = req.query.granularity as 'day' | 'week' | 'month' || 'day';
      const result = await this.service.getEmotionTimeline(req.userId!, granularity);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getNodeConnections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getNodeConnections(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getUserProfile(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const analyticsController = new AnalyticsController();