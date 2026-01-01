"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/v1/entries.routes.ts
const express_1 = require("express");
const EntriesController_1 = require("../../modules/entries/controllers/EntriesController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const entry_schema_1 = require("../../modules/entries/schemas/entry.schema");
const entry_relationships_schema_1 = require("../../modules/entries/schemas/entry-relationships.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/entries
router.get('/', (0, validator_middleware_1.validate)(entry_schema_1.getEntriesSchema), EntriesController_1.entriesController.getAll);
// GET /api/v1/entries/:id
router.get('/:id', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), EntriesController_1.entriesController.getById);
// POST /api/v1/entries
router.post('/', (0, validator_middleware_1.validate)(entry_schema_1.createEntrySchema), EntriesController_1.entriesController.create);
// PUT /api/v1/entries/:id
router.put('/:id', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), (0, validator_middleware_1.validate)(entry_schema_1.updateEntrySchema), EntriesController_1.entriesController.update);
// DELETE /api/v1/entries/:id
router.delete('/:id', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), EntriesController_1.entriesController.delete);
// Relationships endpoints
router.post('/:id/emotions', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), (0, validator_middleware_1.validate)(entry_relationships_schema_1.addEmotionSchema), EntriesController_1.entriesController.addEmotion);
router.post('/:id/tags', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), (0, validator_middleware_1.validate)(entry_relationships_schema_1.addTagSchema), EntriesController_1.entriesController.addTag);
router.post('/:id/people', (0, validator_middleware_1.validate)(entry_schema_1.entryIdSchema), (0, validator_middleware_1.validate)(entry_relationships_schema_1.addPersonSchema), EntriesController_1.entriesController.addPerson);
exports.default = router;
//# sourceMappingURL=entries.routes.js.map