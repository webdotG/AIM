import { Router } from 'express';
import { emotionsController } from '../../modules/emotions/controllers/EmotionsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public
router.get('/', emotionsController.getAll);
router.get('/category/:category', emotionsController.getByCategory);

// Auth
router.use(authenticate);
router.get('/node/:nodeId', emotionsController.getEmotionsForNode);
router.put('/node/:nodeId', emotionsController.replaceEmotionsForNode);
router.delete('/node/:nodeId', emotionsController.removeEmotionsFromNode);
router.get('/stats', emotionsController.getStats);
router.get('/most-frequent', emotionsController.getMostFrequent);
router.get('/distribution', emotionsController.getDistribution);

export default router;