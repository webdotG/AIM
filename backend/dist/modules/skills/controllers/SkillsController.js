"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillsController = exports.SkillsController = void 0;
const SkillsService_1 = require("../services/SkillsService");
const SkillsRepository_1 = require("../repositories/SkillsRepository");
const pool_1 = require("../../../db/pool");
class SkillsController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    category: req.query.category,
                    sort: req.query.sort,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 50,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50)
                };
                const result = await this.skillsService.getAllSkills(userId, filters);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const skill = await this.skillsService.getSkillById(id, userId);
                res.status(200).json({
                    success: true,
                    data: skill
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const skillData = req.body;
                const skill = await this.skillsService.createSkill(skillData, userId);
                res.status(201).json({
                    success: true,
                    data: skill
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const updates = req.body;
                const skill = await this.skillsService.updateSkill(id, updates, userId);
                res.status(200).json({
                    success: true,
                    data: skill
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const result = await this.skillsService.deleteSkill(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Добавить прогресс
        this.addProgress = async (req, res, next) => {
            try {
                const skillId = parseInt(req.params.id);
                const userId = req.userId;
                const progressData = req.body;
                const result = await this.skillsService.addProgress(skillId, progressData, userId);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: result.level_up ? `Level up! +${result.levels_gained} level(s)` : 'Progress added'
                });
            }
            catch (error) {
                next(error);
            }
        };
        // История прогресса
        this.getProgressHistory = async (req, res, next) => {
            try {
                const skillId = parseInt(req.params.id);
                const userId = req.userId;
                const history = await this.skillsService.getProgressHistory(skillId, userId);
                res.status(200).json({
                    success: true,
                    data: history
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Категории навыков
        this.getCategories = async (req, res, next) => {
            try {
                const userId = req.userId;
                const categories = await this.skillsService.getCategories(userId);
                res.status(200).json({
                    success: true,
                    data: categories
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Топ навыков
        this.getTopSkills = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 10;
                const topSkills = await this.skillsService.getTopSkills(userId, limit);
                res.status(200).json({
                    success: true,
                    data: topSkills
                });
            }
            catch (error) {
                next(error);
            }
        };
        const skillsRepository = new SkillsRepository_1.SkillsRepository(pool_1.pool);
        this.skillsService = new SkillsService_1.SkillsService(skillsRepository);
    }
}
exports.SkillsController = SkillsController;
exports.skillsController = new SkillsController();
//# sourceMappingURL=SkillsController.js.map