import { Request, Response, NextFunction } from 'express';
import { ActionsService } from '../services/ActionsService';
import { pool } from '../../../db/pool';

export class ActionsController {
  private service: ActionsService;
  constructor() { this.service = new ActionsService(pool); }

  getActions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = { from_date: req.query.from as string, to_date: req.query.to as string, search: req.query.search as string };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getActions(req.userId!, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getActionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getActionById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createAction(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updateAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateAction(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deleteAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteAction(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };
}

export const actionsController = new ActionsController();