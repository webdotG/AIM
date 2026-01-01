"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CircumstancesController_1 = require("../../modules/circumstances/controllers/CircumstancesController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const circumstance_schema_1 = require("../../modules/circumstances/schemas/circumstance.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/circumstances - получить все обстоятельства
router.get('/', (0, validator_middleware_1.validate)(circumstance_schema_1.getCircumstancesSchema), CircumstancesController_1.circumstancesController.getAll);
// GET /api/v1/circumstances/stats/weather - статистика по погоде
router.get('/stats/weather', CircumstancesController_1.circumstancesController.getWeatherStats);
// GET /api/v1/circumstances/stats/moon-phase - статистика по фазам луны
router.get('/stats/moon-phase', CircumstancesController_1.circumstancesController.getMoonPhaseStats);
// GET /api/v1/circumstances/:id - получить обстоятельство по ID
router.get('/:id', (0, validator_middleware_1.validate)(circumstance_schema_1.circumstanceIdSchema), CircumstancesController_1.circumstancesController.getById);
// POST /api/v1/circumstances - создать новое обстоятельство
router.post('/', (0, validator_middleware_1.validate)(circumstance_schema_1.createCircumstanceSchema), CircumstancesController_1.circumstancesController.create);
// PUT /api/v1/circumstances/:id - обновить обстоятельство
router.put('/:id', (0, validator_middleware_1.validate)(circumstance_schema_1.circumstanceIdSchema), (0, validator_middleware_1.validate)(circumstance_schema_1.updateCircumstanceSchema), CircumstancesController_1.circumstancesController.update);
// DELETE /api/v1/circumstances/:id - удалить обстоятельство
router.delete('/:id', (0, validator_middleware_1.validate)(circumstance_schema_1.circumstanceIdSchema), CircumstancesController_1.circumstancesController.delete);
exports.default = router;
//# sourceMappingURL=circumstances.routes.js.map