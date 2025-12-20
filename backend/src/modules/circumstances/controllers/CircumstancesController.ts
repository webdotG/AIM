// ============================================
// src/modules/circumstances/controllers/CircumstancesController.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { CircumstancesService } from '../services/CircumstancesService';
import { CircumstancesRepository } from '../repositories/CircumstancesRepository';
import { pool } from '../../../db/pool';

export class CircumstancesController {
  private circumstancesService: CircumstancesService;

  constructor() {
    const circumstancesRepository = new CircumstancesRepository(pool);
    this.circumstancesService = new CircumstancesService(circumstancesRepository);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        weather: req.query.weather as string,
        moon_phase: req.query.moon_phase as string,
        has_global_event: req.query.has_global_event === 'true' ? true : req.query.has_global_event === 'false' ? false : undefined,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 50)
      };

      const result = await this.circumstancesService.getAllCircumstances(userId, filters);

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

      const circumstance = await this.circumstancesService.getCircumstanceById(id, userId);

      res.status(200).json({
        success: true,
        data: circumstance
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const circumstanceData = req.body;

      const circumstance = await this.circumstancesService.createCircumstance(circumstanceData, userId);

      res.status(201).json({
        success: true,
        data: circumstance
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

      const circumstance = await this.circumstancesService.updateCircumstance(id, updates, userId);

      res.status(200).json({
        success: true,
        data: circumstance
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const result = await this.circumstancesService.deleteCircumstance(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Статистика по погоде
  getWeatherStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
      const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

      const stats = await this.circumstancesService.getWeatherStats(userId, fromDate, toDate);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // Статистика по фазам луны
  getMoonPhaseStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
      const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

      const stats = await this.circumstancesService.getMoonPhaseStats(userId, fromDate, toDate);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

export const circumstancesController = new CircumstancesController();
