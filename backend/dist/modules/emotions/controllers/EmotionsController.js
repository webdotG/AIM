"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emotionsController = exports.EmotionsController = void 0;
const EmotionsService_1 = require("../services/EmotionsService");
const EmotionsRepository_1 = require("../repositories/EmotionsRepository");
const EntriesRepository_1 = require("../../entries/repositories/EntriesRepository");
const pool_1 = require("../../../db/pool");
class EmotionsController {
    constructor() {
        // GET /api/v1/emotions - все эмоции из справочника
        this.getAll = async (req, res, next) => {
            try {
                const emotions = await this.emotionsService.getAllEmotions();
                res.status(200).json({
                    success: true,
                    data: emotions
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/category/:category - эмоции по категории
        this.getByCategory = async (req, res, next) => {
            try {
                const category = req.params.category;
                const emotions = await this.emotionsService.getEmotionsByCategory(category);
                res.status(200).json({
                    success: true,
                    data: emotions
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/entry/:entryId - эмоции записи
        this.getForEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const emotions = await this.emotionsService.getEmotionsForEntry(entryId, userId);
                res.status(200).json({
                    success: true,
                    data: emotions
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/v1/emotions/entry/:entryId - привязать эмоции
        this.attachToEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const { emotions } = req.body;
                const result = await this.emotionsService.attachEmotionsToEntry(entryId, emotions, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // DELETE /api/v1/emotions/entry/:entryId - удалить все эмоции
        this.detachFromEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const result = await this.emotionsService.detachEmotionsFromEntry(entryId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/stats - статистика
        this.getStats = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = req.query.from ? new Date(req.query.from) : undefined;
                const toDate = req.query.to ? new Date(req.query.to) : undefined;
                const stats = await this.emotionsService.getUserEmotionStats(userId, fromDate, toDate);
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/most-frequent - самые частые
        this.getMostFrequent = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 10;
                const emotions = await this.emotionsService.getMostFrequent(userId, limit);
                res.status(200).json({
                    success: true,
                    data: emotions
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/distribution - распределение по категориям
        this.getDistribution = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = req.query.from ? new Date(req.query.from) : undefined;
                const toDate = req.query.to ? new Date(req.query.to) : undefined;
                const distribution = await this.emotionsService.getCategoryDistribution(userId, fromDate, toDate);
                res.status(200).json({
                    success: true,
                    data: distribution
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/emotions/timeline - эмоции по времени
        this.getTimeline = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = new Date(req.query.from);
                const toDate = new Date(req.query.to);
                const granularity = req.query.granularity || 'day';
                const timeline = await this.emotionsService.getEmotionTimeline(userId, fromDate, toDate, granularity);
                res.status(200).json({
                    success: true,
                    data: timeline
                });
            }
            catch (error) {
                next(error);
            }
        };
        const emotionsRepository = new EmotionsRepository_1.EmotionsRepository(pool_1.pool);
        const entriesRepository = new EntriesRepository_1.EntriesRepository(pool_1.pool);
        this.emotionsService = new EmotionsService_1.EmotionsService(emotionsRepository, entriesRepository);
    }
}
exports.EmotionsController = EmotionsController;
exports.emotionsController = new EmotionsController();
//# sourceMappingURL=EmotionsController.js.map