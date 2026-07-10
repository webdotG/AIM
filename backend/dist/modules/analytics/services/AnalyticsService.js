"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const AnalyticsRepository_1 = require("../repositories/AnalyticsRepository");
class AnalyticsService {
    constructor(pool) {
        this.analyticsRepo = new AnalyticsRepository_1.AnalyticsRepository(pool);
    }
    async getOverallStats(userId) {
        return this.analyticsRepo.getOverallStats(userId);
    }
    async getEntriesByMonth(userId, months = 12) {
        return this.analyticsRepo.getEntriesByMonth(userId, months);
    }
    async getEmotionDistribution(userId) {
        return this.analyticsRepo.getEmotionDistribution(userId);
    }
    async getActivityHeatmap(userId, year) {
        return this.analyticsRepo.getActivityHeatmap(userId, year);
    }
    async getStreaks(userId) {
        return this.analyticsRepo.getStreaks(userId);
    }
    async getEmotionTimeline(userId, granularity = 'day') {
        return this.analyticsRepo.getEmotionTimeline(userId, granularity);
    }
    async getNodeConnections(userId) {
        return this.analyticsRepo.getNodeConnections(userId);
    }
    async getUserProfile(userId) {
        return this.analyticsRepo.getUserProfile(userId);
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=AnalyticsService.js.map