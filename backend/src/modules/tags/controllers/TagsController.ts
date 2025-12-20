import { Request, Response, NextFunction } from 'express';
import { TagsService } from '../services/TagsService';
import { TagsRepository } from '../repositories/TagsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { pool } from '../../../db/pool';

export class TagsController {
  private tagsService: TagsService;

  constructor() {
    const tagsRepository = new TagsRepository(pool);
    const entriesRepository = new EntriesRepository(pool);
    this.tagsService = new TagsService(tagsRepository, entriesRepository);
  }

  // GET /api/v1/tags - все теги
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const filters = {
        search: req.query.search as string,
        sort: req.query.sort as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 100,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 100)
      };

      const result = await this.tagsService.getAllTags(userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/:id - тег по ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const tag = await this.tagsService.getTagById(id, userId);

      res.status(200).json({
        success: true,
        data: tag
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/tags - создать тег
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { name } = req.body;

      const tag = await this.tagsService.createTag(name, userId);

      res.status(201).json({
        success: true,
        data: tag
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/v1/tags/:id - обновить тег
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;
      const { name } = req.body;

      const tag = await this.tagsService.updateTag(id, name, userId);

      res.status(200).json({
        success: true,
        data: tag
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/tags/:id - удалить тег
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const result = await this.tagsService.deleteTag(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/entry/:entryId - теги для записи
  getForEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;

      const tags = await this.tagsService.getTagsForEntry(entryId, userId);

      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/tags/entry/:entryId - привязать теги
  attachToEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;
      const { tags } = req.body;

      const result = await this.tagsService.attachTagsToEntry(entryId, tags, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/tags/entry/:entryId - удалить все теги
  detachFromEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entryId = req.params.entryId;
      const userId = req.userId!;

      const result = await this.tagsService.detachTagsFromEntry(entryId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/:id/entries - записи по тегу
  getEntriesByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tagId = parseInt(req.params.id);
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 50;

      const entries = await this.tagsService.getEntriesByTag(tagId, userId, limit);

      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/most-used - самые используемые
  getMostUsed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 20;

      const tags = await this.tagsService.getMostUsed(userId, limit);

      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/unused - неиспользуемые
  getUnused = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const tags = await this.tagsService.getUnused(userId);

      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/tags/find-or-create - создать или найти
  findOrCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { name } = req.body;

      const tag = await this.tagsService.findOrCreateTag(name, userId);

      res.status(200).json({
        success: true,
        data: tag
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/tags/:id/similar - похожие теги
  getSimilar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tagId = parseInt(req.params.id);
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 5;

      const tags = await this.tagsService.getSimilarTags(tagId, userId, limit);

      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      next(error);
    }
  };
}

export const tagsController = new TagsController();