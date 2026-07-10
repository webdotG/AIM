import { Router } from 'express';
import { peopleController } from '../../modules/people/controllers/PeopleController';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/most-mentioned', peopleController.getMostMentioned);
router.get('/:id', peopleController.getPersonById);
router.get('/:id/contacts', peopleController.getPersonContacts);
router.post('/', peopleController.createPerson);
router.put('/:id', peopleController.updatePerson);
router.delete('/:id', peopleController.deletePerson);

router.get('/', peopleController.getPeople);

export default router;