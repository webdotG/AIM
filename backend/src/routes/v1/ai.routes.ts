import { Router } from 'express';
import { aiController } from '../../modules/ai/controllers/AIController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/analysis/:nodeId', aiController.requestAnalysis);
router.get('/analysis/:nodeId', aiController.getAnalysis);
router.post('/image/:nodeId', aiController.requestImage);
router.get('/image/:nodeId', aiController.getImages);

export default router;