import { Router } from 'express';
import { entriesController } from '../../modules/entries/controllers/EntriesController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import { 
  createEntrySchema, 
  updateEntrySchema, 
  entryIdSchema, 
  getEntriesSchema 
} from '../../modules/entries/schemas/entry.schema';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticate);

// GET /api/v1/entries
router.get('/', validate(getEntriesSchema), entriesController.getAll);

// GET /api/v1/entries/:id
router.get('/:id', validate(entryIdSchema), entriesController.getById);

// POST /api/v1/entries
router.post('/', validate(createEntrySchema), entriesController.create);

// PUT /api/v1/entries/:id
router.put('/:id', validate(entryIdSchema), validate(updateEntrySchema), entriesController.update);

// DELETE /api/v1/entries/:id
router.delete('/:id', validate(entryIdSchema), entriesController.delete);

export default router;