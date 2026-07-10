import { Request, Response, NextFunction } from 'express';
import { TagsService } from '../services/TagsService';
import { pool } from '../../../db/pool';

export class TagsController {
  private service: TagsService;
  constructor() { this.service = new TagsService(pool); }

  getTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = { search: req.query.search as string };
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await this.service.getTags(req.userId!, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getTagById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await this.service.getTagById(parseInt(req.params.id), req.userId!);
      res.status(200).json({ success: true, data: tag });
    } catch (error) { next(error); }
  };

  createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await this.service.createTag(req.userId!, req.body.name);
      res.status(201).json({ success: true, data: tag });
    } catch (error) { next(error); }
  };

  updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await this.service.updateTag(parseInt(req.params.id), req.userId!, req.body.name);
      res.status(200).json({ success: true, data: tag });
    } catch (error) { next(error); }
  };

  deleteTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteTag(parseInt(req.params.id), req.userId!);
      res.status(200).json({ success: true });
    } catch (error) { next(error); }
  };

  findOrCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await this.service.findOrCreate(req.userId!, req.body.name);
      res.status(200).json({ success: true, data: tag });
    } catch (error) { next(error); }
  };

  getNodesByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nodes = await this.service.getNodesByTag(parseInt(req.params.id), req.userId!);
      res.status(200).json({ success: true, data: nodes });
    } catch (error) { next(error); }
  };

  getTagsForNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.service.getTagsForNode(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: tags });
    } catch (error) { next(error); }
  };

  replaceTagsForNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.replaceTagsForNode(req.params.nodeId, req.userId!, req.body.tag_ids);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getMostUsed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.service.getMostUsed(req.userId!, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getUnused = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getUnused(req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const tagsController = new TagsController();