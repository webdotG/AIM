"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SkillsController_1 = require("../../modules/skills/controllers/SkillsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const skill_schema_1 = require("../../modules/skills/schema/skill.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/skills - получить все навыки
router.get('/', (0, validator_middleware_1.validate)(skill_schema_1.getSkillsSchema), SkillsController_1.skillsController.getAll);
// GET /api/v1/skills/categories - категории навыков
router.get('/categories', SkillsController_1.skillsController.getCategories);
// GET /api/v1/skills/top - топ навыков
router.get('/top', (0, validator_middleware_1.validate)(skill_schema_1.topSkillsSchema), SkillsController_1.skillsController.getTopSkills);
// GET /api/v1/skills/:id - получить навык по ID
router.get('/:id', (0, validator_middleware_1.validate)(skill_schema_1.skillIdSchema), SkillsController_1.skillsController.getById);
// POST /api/v1/skills - создать новый навык
router.post('/', (0, validator_middleware_1.validate)(skill_schema_1.createSkillSchema), SkillsController_1.skillsController.create);
// PUT /api/v1/skills/:id - обновить навык
router.put('/:id', (0, validator_middleware_1.validate)(skill_schema_1.skillIdSchema), (0, validator_middleware_1.validate)(skill_schema_1.updateSkillSchema), SkillsController_1.skillsController.update);
// DELETE /api/v1/skills/:id - удалить навык
router.delete('/:id', (0, validator_middleware_1.validate)(skill_schema_1.skillIdSchema), SkillsController_1.skillsController.delete);
// POST /api/v1/skills/:id/progress - добавить прогресс
router.post('/:id/progress', (0, validator_middleware_1.validate)(skill_schema_1.skillIdSchema), (0, validator_middleware_1.validate)(skill_schema_1.addProgressSchema), SkillsController_1.skillsController.addProgress);
// GET /api/v1/skills/:id/progress - история прогресса
router.get('/:id/progress', (0, validator_middleware_1.validate)(skill_schema_1.skillIdSchema), (0, validator_middleware_1.validate)(skill_schema_1.progressHistorySchema), SkillsController_1.skillsController.getProgressHistory);
exports.default = router;
//# sourceMappingURL=skills.routes.js.map