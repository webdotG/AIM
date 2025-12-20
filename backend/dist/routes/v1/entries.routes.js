"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/v1/entries.routes.ts
const express_1 = require("express");
const EntriesController_1 = require("../../modules/entries/controllers/EntriesController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const entry_schema_1 = require("../../modules/entries/schemas/entry.schema");
const router = (0, express_1.Router)();
// Все роуты требуют аутентификации
router.use(auth_middleware_1.authenticate);
// GET /api/v1/entries
router.get('/', EntriesController_1.entriesController.getAll);
// GET /api/v1/entries/:id
router.get('/:id', EntriesController_1.entriesController.getById);
// POST /api/v1/entries
router.post('/', (0, validator_middleware_1.validate)(entry_schema_1.createEntrySchema), EntriesController_1.entriesController.create);
// PUT /api/v1/entries/:id
router.put('/:id', EntriesController_1.entriesController.update);
// DELETE /api/v1/entries/:id
router.delete('/:id', EntriesController_1.entriesController.delete);
exports.default = router;
