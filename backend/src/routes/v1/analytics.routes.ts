import { Router } from 'express';
import { analyticsController } from '../../modules/analytics/controllers/AnalyticsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/stats', analyticsController.getOverallStats);
router.get('/entries-by-month', analyticsController.getEntriesByMonth);
router.get('/emotion-distribution', analyticsController.getEmotionDistribution);
router.get('/activity-heatmap', analyticsController.getActivityHeatmap);
router.get('/streaks', analyticsController.getStreaks);

export default router;