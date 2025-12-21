import { Router } from 'express';
import authRoutes from './auth.routes';
import entriesRoutes from './entries.routes';
import relationsRoutes from './relations.routes';
import emotionsRoutes from './emotions.routes';
import peopleRoutes from './people.routes';
import tagsRoutes from './tags.routes';
import analyticsRoutes from './analytics.routes';
import bodyStatesRoutes from './body-states.routes';
import circumstancesRoutes from './circumstances.routes';
import skillsRoutes from './skills.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/entries', entriesRoutes);
router.use('/relations', relationsRoutes);
router.use('/emotions', emotionsRoutes);
router.use('/people', peopleRoutes);
router.use('/tags', tagsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/body-states', bodyStatesRoutes);
router.use('/circumstances', circumstancesRoutes);
router.use('/skills', skillsRoutes);

export default router;