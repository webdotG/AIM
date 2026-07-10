import { Router } from 'express';
import { thoughtsController } from '../../modules/thoughts/controllers/ThoughtsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', thoughtsController.getThoughts);
router.get('/:id', thoughtsController.getThoughtById);
router.post('/', thoughtsController.createThought);
router.put('/:id', thoughtsController.updateThought);
router.delete('/:id', thoughtsController.deleteThought);

export default router;