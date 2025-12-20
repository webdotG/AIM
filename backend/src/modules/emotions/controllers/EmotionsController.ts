import { Request, Response, NextFunction } from 'express';
import { EmotionsService } from '../services/EmotionsService';
import { EmotionsRepository } from '../repositories/EmotionsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { pool } from '../../../db/pool';

export class EmotionsController {
  private emotionsService: EmotionsService;

  constructor() {
    const emotionsRepository = new EmotionsRepository(pool);
    const entriesRepository = new EntriesRepository(pool);
    this.emotionsService = new EmotionsService(emotionsRepository, entriesRepository);
  }

  // GET /api/v1/emotions - все эмоции из справочника
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emotions = await this.emotionsService.getAllEmotions();

      res.status(200).json({
        success: true,
        data: emotions
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/category/:category - эмоции по категории
  getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.params.category as 'positive' | 'negative' | 'neutral';

      const emotions = await this.emotionsService.getEmotionsByCategory(category);

      res.status(200).json({
        success: true,
        data: emotions
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/entry/:entryId - эмоции записи
  getForEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;

      const emotions = await this.emotionsService.getEmotionsForEntry(entryId, userId);

      res.status(200).json({
        success: true,
        data: emotions
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/emotions/entry/:entryId - привязать эмоции
  attachToEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;
      const { emotions } = req.body;

      const result = await this.emotionsService.attachEmotionsToEntry(entryId, emotions, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/emotions/entry/:entryId - удалить все эмоции
  detachFromEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;

      const result = await this.emotionsService.detachEmotionsFromEntry(entryId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/stats - статистика
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
      const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

      const stats = await this.emotionsService.getUserEmotionStats(userId, fromDate, toDate);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/most-frequent - самые частые
  getMostFrequent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;

      const emotions = await this.emotionsService.getMostFrequent(userId, limit);

      res.status(200).json({
        success: true,
        data: emotions
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/distribution - распределение по категориям
  getDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
      const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

      const distribution = await this.emotionsService.getCategoryDistribution(userId, fromDate, toDate);

      res.status(200).json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/emotions/timeline - эмоции по времени
  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = new Date(req.query.from as string);
      const toDate = new Date(req.query.to as string);
      const granularity = (req.query.granularity as 'day' | 'week' | 'month') || 'day';

      const timeline = await this.emotionsService.getEmotionTimeline(userId, fromDate, toDate, granularity);

      res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  };
}

export const emotionsController = new EmotionsController();
