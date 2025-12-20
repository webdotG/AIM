import { Router } from 'express';
import { tagsController } from '../../modules/tags/controllers/TagsController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createTagSchema,
  updateTagSchema,
  tagIdSchema,
  attachTagsSchema,
  entryIdParamSchema,
  getTagsSchema
} from '../../modules/tags/schemas/tag.schema';

const router = Router();

// Все routes требуют аутентификации
router.use(authenticate);

// GET /api/v1/tags - все теги
router.get('/', validate(getTagsSchema), tagsController.getAll);

// GET /api/v1/tags/most-used - самые используемые
router.get('/most-used', tagsController.getMostUsed);

// GET /api/v1/tags/unused - неиспользуемые
router.get('/unused', tagsController.getUnused);

// POST /api/v1/tags/find-or-create - создать или найти
router.post('/find-or-create', validate(createTagSchema), tagsController.findOrCreate);

// GET /api/v1/tags/:id - тег по ID
router.get('/:id', validate(tagIdSchema), tagsController.getById);

// POST /api/v1/tags - создать тег
router.post('/', validate(createTagSchema), tagsController.create);

// PUT /api/v1/tags/:id - обновить тег
router.put('/:id', validate(tagIdSchema), validate(updateTagSchema), tagsController.update);

// DELETE /api/v1/tags/:id - удалить тег
router.delete('/:id', validate(tagIdSchema), tagsController.delete);

// GET /api/v1/tags/:id/entries - записи по тегу
router.get('/:id/entries', validate(tagIdSchema), tagsController.getEntriesByTag);

// GET /api/v1/tags/:id/similar - похожие теги
router.get('/:id/similar', validate(tagIdSchema), tagsController.getSimilar);

// GET /api/v1/tags/entry/:entryId - теги для записи
router.get('/entry/:entryId', validate(entryIdParamSchema), tagsController.getForEntry);

// POST /api/v1/tags/entry/:entryId - привязать теги
router.post('/entry/:entryId', validate(entryIdParamSchema), validate(attachTagsSchema), tagsController.attachToEntry);

// DELETE /api/v1/tags/entry/:entryId - удалить теги
router.delete('/entry/:entryId', validate(entryIdParamSchema), tagsController.detachFromEntry);

export default router;