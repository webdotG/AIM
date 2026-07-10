"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ActionsController_1 = require("../../modules/actions/controllers/ActionsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', ActionsController_1.actionsController.getActions);
router.get('/:id', ActionsController_1.actionsController.getActionById);
router.post('/', ActionsController_1.actionsController.createAction);
router.put('/:id', ActionsController_1.actionsController.updateAction);
router.delete('/:id', ActionsController_1.actionsController.deleteAction);
exports.default = router;
//# sourceMappingURL=actions.routes.js.map