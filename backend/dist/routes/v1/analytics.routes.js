"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsController_1 = require("../../modules/analytics/controllers/AnalyticsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/profile', AnalyticsController_1.analyticsController.getUserProfile);
router.get('/stats', AnalyticsController_1.analyticsController.getStats);
router.get('/entries-by-month', AnalyticsController_1.analyticsController.getEntriesByMonth);
router.get('/emotion-distribution', AnalyticsController_1.analyticsController.getEmotionDistribution);
router.get('/emotion-timeline', AnalyticsController_1.analyticsController.getEmotionTimeline);
router.get('/activity-heatmap', AnalyticsController_1.analyticsController.getActivityHeatmap);
router.get('/streaks', AnalyticsController_1.analyticsController.getStreaks);
router.get('/node-connections', AnalyticsController_1.analyticsController.getNodeConnections);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map