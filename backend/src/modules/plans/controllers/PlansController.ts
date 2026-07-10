import { Request, Response, NextFunction } from 'express';
import { PlansService } from '../services/PlansService';
import { pool } from '../../../db/pool';

export class PlansController {
  private service: PlansService;
  constructor() { this.service = new PlansService(pool); }

  getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        completed: req.query.completed ? req.query.completed === 'true' : undefined,
        overdue: req.query.overdue === 'true',
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        search: req.query.search as string,
      };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getPlans(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getPlanById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createPlan(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updatePlan(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePlan(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };
}

export const plansController = new PlansController();