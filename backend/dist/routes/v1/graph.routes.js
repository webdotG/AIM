"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GraphController_1 = require("../../modules/graph/controllers/GraphController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const graph_schema_1 = require("../../modules/graph/schemas/graph.schema");
const router = (0, express_1.Router)();
// Public reference data
router.get('/node-types', GraphController_1.graphController.getNodeTypes);
router.get('/edge-types', GraphController_1.graphController.getEdgeTypes);
// Auth required
router.use(auth_middleware_1.authenticate);
router.get('/nodes', GraphController_1.graphController.getNodes);
router.get('/nodes/:id', (0, validator_middleware_1.validate)(graph_schema_1.nodeParamsSchema), GraphController_1.graphController.getNodeById);
router.post('/nodes', (0, validator_middleware_1.validate)(graph_schema_1.createNodeSchema), GraphController_1.graphController.createNode);
router.put('/nodes/:id', (0, validator_middleware_1.validate)(graph_schema_1.updateNodeSchema), GraphController_1.graphController.updateNode);
router.delete('/nodes/:id', (0, validator_middleware_1.validate)(graph_schema_1.nodeParamsSchema), GraphController_1.graphController.deleteNode);
router.post('/edges', (0, validator_middleware_1.validate)(graph_schema_1.createEdgeSchema), GraphController_1.graphController.createEdge);
router.get('/edges/node/:nodeId', GraphController_1.graphController.getEdgesForNode);
router.delete('/edges/:id', (0, validator_middleware_1.validate)(graph_schema_1.edgeParamsSchema), GraphController_1.graphController.deleteEdge);
router.get('/traversal/:nodeId', GraphController_1.graphController.traverseGraph);
router.get('/neighbors/:nodeId', GraphController_1.graphController.getNeighbors);
router.get('/graph-data', GraphController_1.graphController.getGraphData);
router.get('/most-connected', GraphController_1.graphController.getMostConnected);
exports.default = router;
//# sourceMappingURL=graph.routes.js.map