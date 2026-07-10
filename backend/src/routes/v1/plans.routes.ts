import { Router } from 'express';
import { plansController } from '../../modules/plans/controllers/PlansController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', plansController.getPlans);
router.get('/:id', plansController.getPlanById);
router.post('/', plansController.createPlan);
router.put('/:id', plansController.updatePlan);
router.delete('/:id', plansController.deletePlan);

export default router;