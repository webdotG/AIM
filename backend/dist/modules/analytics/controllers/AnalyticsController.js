"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const AnalyticsService_1 = require("../services/AnalyticsService");
const pool_1 = require("../../../db/pool");
class AnalyticsController {
    constructor() {
        this.getStats = async (req, res, next) => {
            try {
                const result = await this.service.getOverallStats(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEntriesByMonth = async (req, res, next) => {
            try {
                const months = parseInt(req.query.months) || 12;
                const result = await this.service.getEntriesByMonth(req.userId, months);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEmotionDistribution = async (req, res, next) => {
            try {
                const result = await this.service.getEmotionDistribution(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActivityHeatmap = async (req, res, next) => {
            try {
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const result = await this.service.getActivityHeatmap(req.userId, year);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getStreaks = async (req, res, next) => {
            try {
                const result = await this.service.getStreaks(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEmotionTimeline = async (req, res, next) => {
            try {
                const granularity = req.query.granularity || 'day';
                const result = await this.service.getEmotionTimeline(req.userId, granularity);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNodeConnections = async (req, res, next) => {
            try {
                const result = await this.service.getNodeConnections(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserProfile = async (req, res, next) => {
            try {
                const result = await this.service.getUserProfile(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new AnalyticsService_1.AnalyticsService(pool_1.pool);
    }
}
exports.AnalyticsController = AnalyticsController;
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=AnalyticsController.js.map