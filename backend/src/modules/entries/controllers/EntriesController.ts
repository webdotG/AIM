// ============================================
// src/modules/entries/controllers/EntriesController.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { EntryService } from '../services/EntryService';
import { EntriesRepository } from '../repositories/EntriesRepository';
import { pool } from '../../../db/pool';

export class EntriesController {
  private entryService: EntryService;

  constructor() {
    const entriesRepository = new EntriesRepository(pool);
    this.entryService = new EntryService(entriesRepository);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const filters = {
        entry_type: req.query.type as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        search: req.query.search as string,
        from_date: req.query.from as string,
        to_date: req.query.to as string,
        body_state_id: req.query.body_state_id ? parseInt(req.query.body_state_id as string) : undefined,
        circumstance_id: req.query.circumstance_id ? parseInt(req.query.circumstance_id as string) : undefined,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 50)
      };

      const result = await this.entryService.getAllEntries(userId, filters);

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
      const { id } = req.params;
      const userId = req.userId!;

      const entry = await this.entryService.getEntryById(id, userId);

      res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const entryData = req.body;

      const entry = await this.entryService.createEntry(entryData, userId);

      res.status(201).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const updates = req.body;

      const entry = await this.entryService.updateEntry(id, updates, userId);

      res.status(200).json({
        success: true,
        data: entry
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const result = await this.entryService.deleteEntry(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const entriesController = new EntriesController();