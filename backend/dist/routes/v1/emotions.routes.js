"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmotionsController_1 = require("../../modules/emotions/controllers/EmotionsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const emotion_schema_1 = require("../../modules/emotions/schemas/emotion.schema");
const router = (0, express_1.Router)();
// Публичный endpoint - список всех эмоций (не требует auth)
router.get('/', EmotionsController_1.emotionsController.getAll);
// Остальные требуют аутентификации
router.use(auth_middleware_1.authenticate);
// GET /api/v1/emotions/category/:category
router.get('/category/:category', (0, validator_middleware_1.validate)(emotion_schema_1.emotionCategorySchema), EmotionsController_1.emotionsController.getByCategory);
// GET /api/v1/emotions/stats - статистика
router.get('/stats', (0, validator_middleware_1.validate)(emotion_schema_1.emotionStatsSchema), EmotionsController_1.emotionsController.getStats);
// GET /api/v1/emotions/most-frequent
router.get('/most-frequent', (0, validator_middleware_1.validate)(emotion_schema_1.mostFrequentSchema), EmotionsController_1.emotionsController.getMostFrequent);
// GET /api/v1/emotions/distribution
router.get('/distribution', (0, validator_middleware_1.validate)(emotion_schema_1.distributionSchema), EmotionsController_1.emotionsController.getDistribution);
// GET /api/v1/emotions/timeline
router.get('/timeline', (0, validator_middleware_1.validate)(emotion_schema_1.timelineSchema), EmotionsController_1.emotionsController.getTimeline);
// GET /api/v1/emotions/entry/:entryId - эмоции для записи
router.get('/entry/:entryId', (0, validator_middleware_1.validate)(emotion_schema_1.entryIdParamSchema), EmotionsController_1.emotionsController.getForEntry);
// POST /api/v1/emotions/entry/:entryId - привязать эмоции
router.post('/entry/:entryId', (0, validator_middleware_1.validate)(emotion_schema_1.entryIdParamSchema), (0, validator_middleware_1.validate)(emotion_schema_1.attachEmotionsSchema), EmotionsController_1.emotionsController.attachToEntry);
// DELETE /api/v1/emotions/entry/:entryId - удалить эмоции
router.delete('/entry/:entryId', (0, validator_middleware_1.validate)(emotion_schema_1.entryIdParamSchema), EmotionsController_1.emotionsController.detachFromEntry);
exports.default = router;
//# sourceMappingURL=emotions.routes.js.map