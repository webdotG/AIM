import { Router } from 'express';
import { emotionsController } from '../../modules/emotions/controllers/EmotionsController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import { 
  attachEmotionsSchema, 
  entryIdParamSchema,
  emotionCategorySchema,
  emotionStatsSchema,
  mostFrequentSchema,
  distributionSchema,
  timelineSchema
} from '../../modules/emotions/schemas/emotion.schema';

const router = Router();

// Публичный endpoint - список всех эмоций (не требует auth)
router.get('/', emotionsController.getAll);

// Остальные требуют аутентификации
router.use(authenticate);

// GET /api/v1/emotions/category/:category
router.get('/category/:category', validate(emotionCategorySchema), emotionsController.getByCategory);

// GET /api/v1/emotions/stats - статистика
router.get('/stats', validate(emotionStatsSchema), emotionsController.getStats);

// GET /api/v1/emotions/most-frequent
router.get('/most-frequent', validate(mostFrequentSchema), emotionsController.getMostFrequent);

// GET /api/v1/emotions/distribution
router.get('/distribution', validate(distributionSchema), emotionsController.getDistribution);

// GET /api/v1/emotions/timeline
router.get('/timeline', validate(timelineSchema), emotionsController.getTimeline);

// GET /api/v1/emotions/entry/:entryId - эмоции для записи
router.get('/entry/:entryId', validate(entryIdParamSchema), emotionsController.getForEntry);

// POST /api/v1/emotions/entry/:entryId - привязать эмоции
router.post('/entry/:entryId', validate(entryIdParamSchema), validate(attachEmotionsSchema), emotionsController.attachToEntry);

// DELETE /api/v1/emotions/entry/:entryId - удалить эмоции
router.delete('/entry/:entryId', validate(entryIdParamSchema), emotionsController.detachFromEntry);

export default router;