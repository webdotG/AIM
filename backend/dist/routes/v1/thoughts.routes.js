"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ThoughtsController_1 = require("../../modules/thoughts/controllers/ThoughtsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', ThoughtsController_1.thoughtsController.getThoughts);
router.get('/:id', ThoughtsController_1.thoughtsController.getThoughtById);
router.post('/', ThoughtsController_1.thoughtsController.createThought);
router.put('/:id', ThoughtsController_1.thoughtsController.updateThought);
router.delete('/:id', ThoughtsController_1.thoughtsController.deleteThought);
exports.default = router;
//# sourceMappingURL=thoughts.routes.js.map