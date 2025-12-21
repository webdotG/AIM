import { Router } from 'express';
import { relationsController } from '../../modules/relations/controllers/RelationsController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createRelationSchema,
  relationIdSchema,
  entryIdSchema,
  getChainSchema,
  mostConnectedSchema,
  graphSchema
} from '../../modules/relations/schemas/relation.schema';

const router = Router();

router.use(authenticate);

// GET /api/v1/relations/types - типы связей (справочник)
router.get('/types', relationsController.getTypes);

// GET /api/v1/relations/most-connected - самые связанные записи
router.get('/most-connected', validate(mostConnectedSchema), relationsController.getMostConnected);

// GET /api/v1/relations/graph - граф для визуализации
router.get('/graph', validate(graphSchema), relationsController.getGraph);

// GET /api/v1/relations/entry/:entryId - связи для записи
router.get('/entry/:entryId', validate(entryIdSchema), relationsController.getForEntry);

// GET /api/v1/relations/chain/:entryId - цепочка связей
router.get('/chain/:entryId', validate(getChainSchema), relationsController.getChain);

// POST /api/v1/relations - создать связь
router.post('/', validate(createRelationSchema), relationsController.create);

// DELETE /api/v1/relations/:id - удалить связь
router.delete('/:id', validate(relationIdSchema), relationsController.delete);

export default router;