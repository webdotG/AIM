"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlansController_1 = require("../../modules/plans/controllers/PlansController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', PlansController_1.plansController.getPlans);
router.get('/:id', PlansController_1.plansController.getPlanById);
router.post('/', PlansController_1.plansController.createPlan);
router.put('/:id', PlansController_1.plansController.updatePlan);
router.delete('/:id', PlansController_1.plansController.deletePlan);
exports.default = router;
//# sourceMappingURL=plans.routes.js.map