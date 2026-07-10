"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traversalSchema = exports.edgeParamsSchema = exports.createEdgeSchema = exports.nodeParamsSchema = exports.updateNodeSchema = exports.createNodeSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../../../shared/types");
exports.createNodeSchema = zod_1.z.object({
    body: zod_1.z.object({
        node_type_code: zod_1.z.nativeEnum(types_1.NodeTypeCode),
        title: zod_1.z.string().max(300).optional().nullable(),
    }),
});
exports.updateNodeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid node ID format'),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().max(300).optional().nullable(),
    }),
});
exports.nodeParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid node ID format'),
    }),
});
exports.createEdgeSchema = zod_1.z.object({
    body: zod_1.z.object({
        from_node_id: zod_1.z.string().uuid('Invalid source node ID'),
        to_node_id: zod_1.z.string().uuid('Invalid target node ID'),
        edge_type_code: zod_1.z.nativeEnum(types_1.EdgeTypeCode),
        confidence: zod_1.z.number().min(0).max(1).optional().nullable(),
        weight: zod_1.z.number().min(0).max(1000).optional().nullable(),
        notes: zod_1.z.string().max(1000).optional().nullable(),
    }),
});
exports.edgeParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'Edge ID must be a number'),
    }),
});
exports.traversalSchema = zod_1.z.object({
    params: zod_1.z.object({
        nodeId: zod_1.z.string().uuid('Invalid node ID format'),
    }),
    query: zod_1.z.object({
        direction: zod_1.z.enum(['forward', 'backward', 'both']).optional(),
        depth: zod_1.z.string().regex(/^\d+$/).optional(),
        filterNodeType: zod_1.z.nativeEnum(types_1.NodeTypeCode).optional(),
        filterEdgeType: zod_1.z.nativeEnum(types_1.EdgeTypeCode).optional(),
        minConfidence: zod_1.z.string().regex(/^\d*\.?\d+$/).optional(),
    }),
});
//# sourceMappingURL=graph.schema.js.map