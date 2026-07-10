import { Request, Response, NextFunction } from 'express';
import { PeopleService } from '../services/PeopleService';
import { pool } from '../../../db/pool';

export class PeopleController {
  private service: PeopleService;
  constructor() { this.service = new PeopleService(pool); }

  getPeople = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = { search: req.query.search as string, relationship: req.query.relationship as string };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getPeople(req.userId!, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getMostMentioned = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.service.getMostMentioned(req.userId!, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getPersonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getPersonById(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  createPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createPerson(req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  updatePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updatePerson(req.params.id, req.userId!, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deletePerson(req.params.id, req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };

  getPersonContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getPersonContacts(req.params.id, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const peopleController = new PeopleController();