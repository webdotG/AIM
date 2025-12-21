import { Router } from 'express';
import { analyticsController } from '../../modules/analytics/controllers/AnalyticsController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  overallStatsSchema,
  entriesByMonthSchema,
  emotionDistributionSchema,
  activityHeatmapSchema,
  streaksSchema
} from '../../modules/analytics/schemas/analytics.schema';

const router = Router();
router.use(authenticate);

router.get('/stats', validate(overallStatsSchema), analyticsController.getOverallStats);
router.get('/entries-by-month', validate(entriesByMonthSchema), analyticsController.getEntriesByMonth);
router.get('/emotion-distribution', validate(emotionDistributionSchema), analyticsController.getEmotionDistribution);
router.get('/activity-heatmap', validate(activityHeatmapSchema), analyticsController.getActivityHeatmap);
router.get('/streaks', validate(streaksSchema), analyticsController.getStreaks);

export default router;