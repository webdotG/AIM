"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DreamsController_1 = require("../../modules/dreams/controllers/DreamsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', DreamsController_1.dreamsController.getDreams);
router.get('/:id', DreamsController_1.dreamsController.getDreamById);
router.post('/', DreamsController_1.dreamsController.createDream);
router.put('/:id', DreamsController_1.dreamsController.updateDream);
router.delete('/:id', DreamsController_1.dreamsController.deleteDream);
exports.default = router;
//# sourceMappingURL=dreams.routes.js.map