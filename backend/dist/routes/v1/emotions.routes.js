"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmotionsController_1 = require("../../modules/emotions/controllers/EmotionsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public
router.get('/', EmotionsController_1.emotionsController.getAll);
router.get('/category/:category', EmotionsController_1.emotionsController.getByCategory);
// Auth
router.use(auth_middleware_1.authenticate);
router.get('/node/:nodeId', EmotionsController_1.emotionsController.getEmotionsForNode);
router.put('/node/:nodeId', EmotionsController_1.emotionsController.replaceEmotionsForNode);
router.delete('/node/:nodeId', EmotionsController_1.emotionsController.removeEmotionsFromNode);
router.get('/stats', EmotionsController_1.emotionsController.getStats);
router.get('/most-frequent', EmotionsController_1.emotionsController.getMostFrequent);
router.get('/distribution', EmotionsController_1.emotionsController.getDistribution);
exports.default = router;
//# sourceMappingURL=emotions.routes.js.map