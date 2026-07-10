import { Router } from 'express';
import { graphController } from '../../modules/graph/controllers/GraphController';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validator.middleware';
import {
  createNodeSchema,
  updateNodeSchema,
  nodeParamsSchema,
  createEdgeSchema,
  edgeParamsSchema,
} from '../../modules/graph/schemas/graph.schema';

const router = Router();

// Public reference data
router.get('/node-types', graphController.getNodeTypes);
router.get('/edge-types', graphController.getEdgeTypes);

// Auth required
router.use(authenticate);

router.get('/nodes', graphController.getNodes);
router.get('/nodes/:id', validate(nodeParamsSchema), graphController.getNodeById);
router.post('/nodes', validate(createNodeSchema), graphController.createNode);
router.put('/nodes/:id', validate(updateNodeSchema), graphController.updateNode);
router.delete('/nodes/:id', validate(nodeParamsSchema), graphController.deleteNode);

router.post('/edges', validate(createEdgeSchema), graphController.createEdge);
router.get('/edges/node/:nodeId', graphController.getEdgesForNode);
router.delete('/edges/:id', validate(edgeParamsSchema), graphController.deleteEdge);

router.get('/traversal/:nodeId', graphController.traverseGraph);
router.get('/neighbors/:nodeId', graphController.getNeighbors);
router.get('/graph-data', graphController.getGraphData);
router.get('/most-connected', graphController.getMostConnected);

export default router;