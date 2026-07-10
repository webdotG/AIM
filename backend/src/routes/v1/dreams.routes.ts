import { Router } from 'express';
import { dreamsController } from '../../modules/dreams/controllers/DreamsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', dreamsController.getDreams);
router.get('/:id', dreamsController.getDreamById);
router.post('/', dreamsController.createDream);
router.put('/:id', dreamsController.updateDream);
router.delete('/:id', dreamsController.deleteDream);

export default router;