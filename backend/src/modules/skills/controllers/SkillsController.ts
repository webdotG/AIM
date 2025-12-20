import { Request, Response, NextFunction } from 'express';
import { SkillsService } from '../services/SkillsService';
import { SkillsRepository } from '../repositories/SkillsRepository';
import { pool } from '../../../db/pool';

export class SkillsController {
  private skillsService: SkillsService;

  constructor() {
    const skillsRepository = new SkillsRepository(pool);
    this.skillsService = new SkillsService(skillsRepository);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const filters = {
        category: req.query.category as string,
        sort: req.query.sort as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 50)
      };

      const result = await this.skillsService.getAllSkills(userId, filters);

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

      const skill = await this.skillsService.getSkillById(id, userId);

      res.status(200).json({
        success: true,
        data: skill
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const skillData = req.body;

      const skill = await this.skillsService.createSkill(skillData, userId);

      res.status(201).json({
        success: true,
        data: skill
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

      const skill = await this.skillsService.updateSkill(id, updates, userId);

      res.status(200).json({
        success: true,
        data: skill
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.userId!;

      const result = await this.skillsService.deleteSkill(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Добавить прогресс
  addProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillId = parseInt(req.params.id);
      const userId = req.userId!;
      const progressData = req.body;

      const result = await this.skillsService.addProgress(skillId, progressData, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: result.level_up ? `Level up! +${result.levels_gained} level(s)` : 'Progress added'
      });
    } catch (error) {
      next(error);
    }
  };

  // История прогресса
  getProgressHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillId = parseInt(req.params.id);
      const userId = req.userId!;

      const history = await this.skillsService.getProgressHistory(skillId, userId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  };

  // Категории навыков
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const categories = await this.skillsService.getCategories(userId);

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  // Топ навыков
  getTopSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;

      const topSkills = await this.skillsService.getTopSkills(userId, limit);

      res.status(200).json({
        success: true,
        data: topSkills
      });
    } catch (error) {
      next(error);
    }
  };
}

export const skillsController = new SkillsController();
