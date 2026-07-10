import { Router } from 'express';
import { tagsController } from '../../modules/tags/controllers/TagsController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', tagsController.getTags);
router.get('/most-used', tagsController.getMostUsed);
router.get('/unused', tagsController.getUnused);
router.post('/find-or-create', tagsController.findOrCreate);
router.get('/:id', tagsController.getTagById);
router.get('/:id/nodes', tagsController.getNodesByTag);
router.post('/', tagsController.createTag);
router.put('/:id', tagsController.updateTag);
router.delete('/:id', tagsController.deleteTag);
router.get('/node/:nodeId', tagsController.getTagsForNode);
router.put('/node/:nodeId', tagsController.replaceTagsForNode);

export default router;