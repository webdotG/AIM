import { Router } from 'express';
import { analyticsController } from '../../modules/analytics/controllers/AnalyticsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/profile', analyticsController.getUserProfile);
router.get('/stats', analyticsController.getStats);
router.get('/entries-by-month', analyticsController.getEntriesByMonth);
router.get('/emotion-distribution', analyticsController.getEmotionDistribution);
router.get('/emotion-timeline', analyticsController.getEmotionTimeline);
router.get('/activity-heatmap', analyticsController.getActivityHeatmap);
router.get('/streaks', analyticsController.getStreaks);
router.get('/node-connections', analyticsController.getNodeConnections);

export default router;