import { Router } from 'express';
import authRoutes from './auth.routes';
import graphRoutes from './graph.routes';
import dreamsRoutes from './dreams.routes';
import thoughtsRoutes from './thoughts.routes';
import memoriesRoutes from './memories.routes';
import plansRoutes from './plans.routes';
import actionsRoutes from './actions.routes';
import peopleRoutes from './people.routes';
import emotionsRoutes from './emotions.routes';
import tagsRoutes from './tags.routes';
import analyticsRoutes from './analytics.routes';
import measurementsRoutes from './measurements.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/graph', graphRoutes);
router.use('/dreams', dreamsRoutes);
router.use('/thoughts', thoughtsRoutes);
router.use('/memories', memoriesRoutes);
router.use('/plans', plansRoutes);
router.use('/actions', actionsRoutes);
router.use('/people', peopleRoutes);
router.use('/emotions', emotionsRoutes);
router.use('/tags', tagsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/measurements', measurementsRoutes);
router.use('/ai', aiRoutes);

export default router;