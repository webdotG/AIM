"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emotionsController = exports.EmotionsController = void 0;
const EmotionsService_1 = require("../services/EmotionsService");
const pool_1 = require("../../../db/pool");
class EmotionsController {
    constructor() {
        // Public
        this.getAll = async (req, res, next) => {
            try {
                const emotions = await this.service.getAllEmotions();
                res.status(200).json({ success: true, data: emotions });
            }
            catch (error) {
                next(error);
            }
        };
        this.getByCategory = async (req, res, next) => {
            try {
                const emotions = await this.service.getByCategory(req.params.category);
                res.status(200).json({ success: true, data: emotions });
            }
            catch (error) {
                next(error);
            }
        };
        // Auth required
        this.getEmotionsForNode = async (req, res, next) => {
            try {
                const emotions = await this.service.getEmotionsForNode(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: emotions });
            }
            catch (error) {
                next(error);
            }
        };
        this.replaceEmotionsForNode = async (req, res, next) => {
            try {
                const result = await this.service.replaceEmotionsForNode(req.params.nodeId, req.userId, req.body.emotions);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.removeEmotionsFromNode = async (req, res, next) => {
            try {
                const result = await this.service.removeEmotionsFromNode(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStats = async (req, res, next) => {
            try {
                const result = await this.service.getStats(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMostFrequent = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.service.getMostFrequent(req.userId, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDistribution = async (req, res, next) => {
            try {
                const granularity = req.query.granularity || 'day';
                const result = await this.service.getDistribution(req.userId, granularity);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new EmotionsService_1.EmotionsService(pool_1.pool);
    }
}
exports.EmotionsController = EmotionsController;
exports.emotionsController = new EmotionsController();
//# sourceMappingURL=EmotionsController.js.map