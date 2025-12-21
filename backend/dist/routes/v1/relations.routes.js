"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RelationsController_1 = require("../../modules/relations/controllers/RelationsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const relation_schema_1 = require("../../modules/relations/schemas/relation.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/v1/relations/types - типы связей (справочник)
router.get('/types', RelationsController_1.relationsController.getTypes);
// GET /api/v1/relations/most-connected - самые связанные записи
router.get('/most-connected', (0, validator_middleware_1.validate)(relation_schema_1.mostConnectedSchema), RelationsController_1.relationsController.getMostConnected);
// GET /api/v1/relations/graph - граф для визуализации
router.get('/graph', (0, validator_middleware_1.validate)(relation_schema_1.graphSchema), RelationsController_1.relationsController.getGraph);
// GET /api/v1/relations/entry/:entryId - связи для записи
router.get('/entry/:entryId', (0, validator_middleware_1.validate)(relation_schema_1.entryIdSchema), RelationsController_1.relationsController.getForEntry);
// GET /api/v1/relations/chain/:entryId - цепочка связей
router.get('/chain/:entryId', (0, validator_middleware_1.validate)(relation_schema_1.getChainSchema), RelationsController_1.relationsController.getChain);
// POST /api/v1/relations - создать связь
router.post('/', (0, validator_middleware_1.validate)(relation_schema_1.createRelationSchema), RelationsController_1.relationsController.create);
// DELETE /api/v1/relations/:id - удалить связь
router.delete('/:id', (0, validator_middleware_1.validate)(relation_schema_1.relationIdSchema), RelationsController_1.relationsController.delete);
exports.default = router;
