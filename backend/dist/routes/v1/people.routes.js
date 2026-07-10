"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PeopleController_1 = require("../../modules/people/controllers/PeopleController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/most-mentioned', PeopleController_1.peopleController.getMostMentioned);
router.get('/:id', PeopleController_1.peopleController.getPersonById);
router.get('/:id/contacts', PeopleController_1.peopleController.getPersonContacts);
router.post('/', PeopleController_1.peopleController.createPerson);
router.put('/:id', PeopleController_1.peopleController.updatePerson);
router.delete('/:id', PeopleController_1.peopleController.deletePerson);
router.get('/', PeopleController_1.peopleController.getPeople);
exports.default = router;
//# sourceMappingURL=people.routes.js.map