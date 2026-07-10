import { Router } from 'express';
import { memoriesController } from '../../modules/memories/controllers/MemoriesController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', memoriesController.getMemories);
router.get('/:id', memoriesController.getMemoryById);
router.post('/', memoriesController.createMemory);
router.put('/:id', memoriesController.updateMemory);
router.delete('/:id', memoriesController.deleteMemory);

export default router;