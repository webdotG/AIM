"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const AnalyticsService_1 = require("../services/AnalyticsService");
const pool_1 = require("../../../db/pool");
class AnalyticsController {
    constructor() {
        this.getOverallStats = async (req, res, next) => {
            try {
                const userId = req.userId;
                const stats = await this.analyticsService.getOverallStats(userId);
                res.status(200).json({ success: true, data: stats });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEntriesByMonth = async (req, res, next) => {
            try {
                const userId = req.userId;
                const months = parseInt(req.query.months) || 12;
                const data = await this.analyticsService.getEntriesByMonth(userId, months);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEmotionDistribution = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = req.query.from ? new Date(req.query.from) : undefined;
                const toDate = req.query.to ? new Date(req.query.to) : undefined;
                const data = await this.analyticsService.getEmotionDistribution(userId, fromDate, toDate);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActivityHeatmap = async (req, res, next) => {
            try {
                const userId = req.userId;
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const data = await this.analyticsService.getActivityHeatmap(userId, year);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStreaks = async (req, res, next) => {
            try {
                const userId = req.userId;
                const data = await this.analyticsService.getStreaks(userId);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
        this.analyticsService = new AnalyticsService_1.AnalyticsService(pool_1.pool);
    }
}
exports.AnalyticsController = AnalyticsController;
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=AnalyticsController.js.map