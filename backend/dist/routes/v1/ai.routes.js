"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIController_1 = require("../../modules/ai/controllers/AIController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/analysis/:nodeId', AIController_1.aiController.requestAnalysis);
router.get('/analysis/:nodeId', AIController_1.aiController.getAnalysis);
router.post('/image/:nodeId', AIController_1.aiController.requestImage);
router.get('/image/:nodeId', AIController_1.aiController.getImages);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map