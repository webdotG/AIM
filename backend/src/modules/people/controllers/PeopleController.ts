import { Request, Response, NextFunction } from 'express';
import { PeopleService } from '../services/PeopleService';
import { PeopleRepository } from '../repositories/PeopleRepository';
import { pool } from '../../../db/pool';

export class PeopleController {
  private peopleService: PeopleService;

  constructor() {
    const peopleRepository = new PeopleRepository(pool);
    this.peopleService = new PeopleService(peopleRepository);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filters = {
        category: req.query.category as string,
        search: req.query.search as string,
        sort: req.query.sort as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 50)
      };

      const result = await this.peopleService.getAllPeople(userId, filters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;
      const person = await this.peopleService.getPersonById(id, userId);
      res.status(200).json({ success: true, data: person });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const person = await this.peopleService.createPerson(req.body, userId);
      res.status(201).json({ success: true, data: person });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;
      const person = await this.peopleService.updatePerson(id, req.body, userId);
      res.status(200).json({ success: true, data: person });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;
      const result = await this.peopleService.deletePerson(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMostMentioned = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;
      const people = await this.peopleService.getMostMentioned(userId, limit);
      res.status(200).json({ success: true, data: people });
    } catch (error) {
      next(error);
    }
  };
}

export const peopleController = new PeopleController();
