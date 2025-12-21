import { Router } from 'express';
import { peopleController } from '../../modules/people/controllers/PeopleController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import { 
  createPersonSchema, 
  updatePersonSchema, 
  personIdSchema, 
  getPeopleSchema,
  mostMentionedSchema 
} from '../../modules/people/schemas/person.schema';

const router = Router();
router.use(authenticate);

router.get('/', validate(getPeopleSchema), peopleController.getAll);
router.get('/most-mentioned', validate(mostMentionedSchema), peopleController.getMostMentioned);
router.get('/:id', validate(personIdSchema), peopleController.getById);
router.post('/', validate(createPersonSchema), peopleController.create);
router.put('/:id', validate(personIdSchema), validate(updatePersonSchema), peopleController.update);
router.delete('/:id', validate(personIdSchema), peopleController.delete);

export default router;