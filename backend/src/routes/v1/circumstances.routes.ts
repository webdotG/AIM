import { Router } from 'express';
import { circumstancesController } from '../../modules/circumstances/controllers/CircumstancesController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createCircumstanceSchema,
  updateCircumstanceSchema,
  circumstanceIdSchema,
  getCircumstancesSchema
} from '../../modules/circumstances/schemas/circumstance.schema';

const router = Router();

router.use(authenticate);

// GET /api/v1/circumstances - получить все обстоятельства
router.get('/', validate(getCircumstancesSchema), circumstancesController.getAll);

// GET /api/v1/circumstances/stats/weather - статистика по погоде
router.get('/stats/weather', circumstancesController.getWeatherStats);

// GET /api/v1/circumstances/stats/moon-phase - статистика по фазам луны
router.get('/stats/moon-phase', circumstancesController.getMoonPhaseStats);

// GET /api/v1/circumstances/:id - получить обстоятельство по ID
router.get('/:id', validate(circumstanceIdSchema), circumstancesController.getById);

// POST /api/v1/circumstances - создать новое обстоятельство
router.post('/', validate(createCircumstanceSchema), circumstancesController.create);

// PUT /api/v1/circumstances/:id - обновить обстоятельство
router.put('/:id', validate(circumstanceIdSchema), validate(updateCircumstanceSchema), circumstancesController.update);

// DELETE /api/v1/circumstances/:id - удалить обстоятельство
router.delete('/:id', validate(circumstanceIdSchema), circumstancesController.delete);

export default router;