import { Router } from 'express';
import { skillsController } from '../../modules/skills/controllers/SkillsController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createSkillSchema,
  updateSkillSchema,
  skillIdSchema,
  getSkillsSchema,
  addProgressSchema,
  topSkillsSchema,
  progressHistorySchema
} from '../../modules/skills/schema/skill.schema';

const router = Router();

router.use(authenticate);

// GET /api/v1/skills - получить все навыки
router.get('/', validate(getSkillsSchema), skillsController.getAll);

// GET /api/v1/skills/categories - категории навыков
router.get('/categories', skillsController.getCategories);

// GET /api/v1/skills/top - топ навыков
router.get('/top', validate(topSkillsSchema), skillsController.getTopSkills);

// GET /api/v1/skills/:id - получить навык по ID
router.get('/:id', validate(skillIdSchema), skillsController.getById);

// POST /api/v1/skills - создать новый навык
router.post('/', validate(createSkillSchema), skillsController.create);

// PUT /api/v1/skills/:id - обновить навык
router.put('/:id', validate(skillIdSchema), validate(updateSkillSchema), skillsController.update);

// DELETE /api/v1/skills/:id - удалить навык
router.delete('/:id', validate(skillIdSchema), skillsController.delete);

// POST /api/v1/skills/:id/progress - добавить прогресс
router.post('/:id/progress', validate(skillIdSchema), validate(addProgressSchema), skillsController.addProgress);

// GET /api/v1/skills/:id/progress - история прогресса
router.get('/:id/progress', validate(skillIdSchema), validate(progressHistorySchema), skillsController.getProgressHistory);

export default router;