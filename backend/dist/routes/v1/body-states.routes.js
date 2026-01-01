"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BodyStatesController_1 = require("../../modules/body-states/controllers/BodyStatesController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const body_state_schema_1 = require("../../modules/body-states/schemas/body-state.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/body-states - получить все состояния тела
router.get('/', (0, validator_middleware_1.validate)(body_state_schema_1.getBodyStatesSchema), BodyStatesController_1.bodyStatesController.getAll);
// GET /api/v1/body-states/:id - получить состояние по ID
router.get('/:id', (0, validator_middleware_1.validate)(body_state_schema_1.bodyStateIdSchema), BodyStatesController_1.bodyStatesController.getById);
// POST /api/v1/body-states - создать новое состояние
router.post('/', (0, validator_middleware_1.validate)(body_state_schema_1.createBodyStateSchema), BodyStatesController_1.bodyStatesController.create);
// PUT /api/v1/body-states/:id - обновить состояние
router.put('/:id', (0, validator_middleware_1.validate)(body_state_schema_1.bodyStateIdSchema), (0, validator_middleware_1.validate)(body_state_schema_1.updateBodyStateSchema), BodyStatesController_1.bodyStatesController.update);
// DELETE /api/v1/body-states/:id - удалить состояние
router.delete('/:id', (0, validator_middleware_1.validate)(body_state_schema_1.bodyStateIdSchema), BodyStatesController_1.bodyStatesController.delete);
exports.default = router;
//# sourceMappingURL=body-states.routes.js.map