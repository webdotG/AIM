"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TagsController_1 = require("../../modules/tags/controllers/TagsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const tag_schema_1 = require("../../modules/tags/schemas/tag.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/tags - все теги
router.get('/', (0, validator_middleware_1.validate)(tag_schema_1.getTagsSchema), TagsController_1.tagsController.getAll);
// GET /api/v1/tags/most-used - самые используемые
router.get('/most-used', (0, validator_middleware_1.validate)(tag_schema_1.mostUsedSchema), TagsController_1.tagsController.getMostUsed);
// GET /api/v1/tags/unused - неиспользуемые
router.get('/unused', (0, validator_middleware_1.validate)(tag_schema_1.unusedSchema), TagsController_1.tagsController.getUnused);
// POST /api/v1/tags/find-or-create - создать или найти
router.post('/find-or-create', (0, validator_middleware_1.validate)(tag_schema_1.createTagSchema), TagsController_1.tagsController.findOrCreate);
// GET /api/v1/tags/:id - тег по ID
router.get('/:id', (0, validator_middleware_1.validate)(tag_schema_1.tagIdSchema), TagsController_1.tagsController.getById);
// POST /api/v1/tags - создать тег
router.post('/', (0, validator_middleware_1.validate)(tag_schema_1.createTagSchema), TagsController_1.tagsController.create);
// PUT /api/v1/tags/:id - обновить тег
router.put('/:id', (0, validator_middleware_1.validate)(tag_schema_1.tagIdSchema), (0, validator_middleware_1.validate)(tag_schema_1.updateTagSchema), TagsController_1.tagsController.update);
// DELETE /api/v1/tags/:id - удалить тег
router.delete('/:id', (0, validator_middleware_1.validate)(tag_schema_1.tagIdSchema), TagsController_1.tagsController.delete);
// GET /api/v1/tags/:id/entries - записи по тегу
router.get('/:id/entries', (0, validator_middleware_1.validate)(tag_schema_1.tagIdSchema), (0, validator_middleware_1.validate)(tag_schema_1.entriesByTagSchema), TagsController_1.tagsController.getEntriesByTag);
// GET /api/v1/tags/:id/similar - похожие теги
router.get('/:id/similar', (0, validator_middleware_1.validate)(tag_schema_1.tagIdSchema), (0, validator_middleware_1.validate)(tag_schema_1.similarTagsSchema), TagsController_1.tagsController.getSimilar);
// GET /api/v1/tags/entry/:entryId - теги для записи
router.get('/entry/:entryId', (0, validator_middleware_1.validate)(tag_schema_1.entryIdParamSchema), TagsController_1.tagsController.getForEntry);
// POST /api/v1/tags/entry/:entryId - привязать теги
router.post('/entry/:entryId', (0, validator_middleware_1.validate)(tag_schema_1.entryIdParamSchema), (0, validator_middleware_1.validate)(tag_schema_1.attachTagsSchema), TagsController_1.tagsController.attachToEntry);
// DELETE /api/v1/tags/entry/:entryId - удалить теги
router.delete('/entry/:entryId', (0, validator_middleware_1.validate)(tag_schema_1.entryIdParamSchema), TagsController_1.tagsController.detachFromEntry);
exports.default = router;
