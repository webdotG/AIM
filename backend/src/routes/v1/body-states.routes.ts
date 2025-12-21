import { Router } from 'express';
import { bodyStatesController } from '../../modules/body-states/controllers/BodyStatesController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createBodyStateSchema,
  updateBodyStateSchema,
  bodyStateIdSchema,
  getBodyStatesSchema
} from '../../modules/body-states/schemas/body-state.schema';

const router = Router();

router.use(authenticate);

// GET /api/v1/body-states - получить все состояния тела
router.get('/', validate(getBodyStatesSchema), bodyStatesController.getAll);

// GET /api/v1/body-states/:id - получить состояние по ID
router.get('/:id', validate(bodyStateIdSchema), bodyStatesController.getById);

// POST /api/v1/body-states - создать новое состояние
router.post('/', validate(createBodyStateSchema), bodyStatesController.create);

// PUT /api/v1/body-states/:id - обновить состояние
router.put('/:id', validate(bodyStateIdSchema), validate(updateBodyStateSchema), bodyStatesController.update);

// DELETE /api/v1/body-states/:id - удалить состояние
router.delete('/:id', validate(bodyStateIdSchema), bodyStatesController.delete);

export default router;