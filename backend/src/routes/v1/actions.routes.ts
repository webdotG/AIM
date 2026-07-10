import { Router } from 'express';
import { actionsController } from '../../modules/actions/controllers/ActionsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', actionsController.getActions);
router.get('/:id', actionsController.getActionById);
router.post('/', actionsController.createAction);
router.put('/:id', actionsController.updateAction);
router.delete('/:id', actionsController.deleteAction);

export default router;