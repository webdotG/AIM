// src/modules/entries/controllers/EntriesController.ts
import { Request, Response, NextFunction } from 'express';
import { EntryService } from '../services/EntryService';
import { EntriesRepository } from '../repositories/EntriesRepository';
import { EntryEmotionsRepository } from '../repositories/EntryEmotionsRepository';
import { EntryTagsRepository } from '../repositories/EntryTagsRepository';
import { EntryPeopleRepository } from '../repositories/EntryPeopleRepository';
import { pool } from '../../../db/pool';

export class EntriesController {
  private entryService: EntryService;

  constructor() {
    const entriesRepository = new EntriesRepository(pool);
    const entryEmotionsRepository = new EntryEmotionsRepository(pool);
    const entryTagsRepository = new EntryTagsRepository(pool);
    const entryPeopleRepository = new EntryPeopleRepository(pool);
    
    this.entryService = new EntryService(
      entriesRepository,
      entryEmotionsRepository,
      entryTagsRepository,
      entryPeopleRepository
    );
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

      console.log('=== IN CREATE CONTROLLER ===');
      console.log('Controller req.userId:', req.userId);
      console.log('Controller headers:', req.headers);
      
      console.log('Extracted userId:', userId, 'type:', typeof userId);
      console.log('Entry data:', entryData);
      
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

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  // Добавьте эти методы для relationships:
  addEmotion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { emotion_id, intensity } = req.body;

      const result = await this.entryService.addEmotionToEntry(id, emotion_id, intensity, userId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  addTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { tag_id } = req.body;

      const result = await this.entryService.addTagToEntry(id, tag_id, userId);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  addPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { person_id, role } = req.body;

      const result = await this.entryService.addPersonToEntry(id, person_id, userId, role);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

export const entriesController = new EntriesController();