import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { pool } from '../../../db/pool';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService(pool);
  }

  getOverallStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const stats = await this.analyticsService.getOverallStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getEntriesByMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const months = parseInt(req.query.months as string) || 12;
      const data = await this.analyticsService.getEntriesByMonth(userId, months);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getEmotionDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
      const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
      const data = await this.analyticsService.getEmotionDistribution(userId, fromDate, toDate);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getActivityHeatmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await this.analyticsService.getActivityHeatmap(userId, year);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getStreaks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = await this.analyticsService.getStreaks(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
