"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MemoriesController_1 = require("../../modules/memories/controllers/MemoriesController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', MemoriesController_1.memoriesController.getMemories);
router.get('/:id', MemoriesController_1.memoriesController.getMemoryById);
router.post('/', MemoriesController_1.memoriesController.createMemory);
router.put('/:id', MemoriesController_1.memoriesController.updateMemory);
router.delete('/:id', MemoriesController_1.memoriesController.deleteMemory);
exports.default = router;
//# sourceMappingURL=memories.routes.js.map