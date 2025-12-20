// src/routes/v1/entries.routes.ts
import { Router } from 'express';
import { entriesController } from '../../modules/entries/controllers/EntriesController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import { createEntrySchema } from '../../modules/entries/schemas/entry.schema';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticate);

// GET /api/v1/entries
router.get('/', entriesController.getAll);

// GET /api/v1/entries/:id
router.get('/:id', entriesController.getById);

// POST /api/v1/entries
router.post('/', validate(createEntrySchema), entriesController.create);

// PUT /api/v1/entries/:id
router.put('/:id', entriesController.update);

// DELETE /api/v1/entries/:id
router.delete('/:id', entriesController.delete);

export default router;