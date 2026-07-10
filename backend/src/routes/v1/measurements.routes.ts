import { Router } from 'express';
import { measurementsController } from '../../modules/measurements/controllers/MeasurementsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/node/:nodeId', measurementsController.createMeasurement);
router.get('/node/:nodeId', measurementsController.getMeasurements);
router.delete('/node/:nodeId', measurementsController.deleteMeasurements);

export default router;