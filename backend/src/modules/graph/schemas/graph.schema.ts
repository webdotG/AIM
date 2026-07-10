import { z } from 'zod';
import { NodeTypeCode, EdgeTypeCode } from '../../../shared/types';

export const createNodeSchema = z.object({
  body: z.object({
    node_type_code: z.nativeEnum(NodeTypeCode),
    title: z.string().max(300).optional().nullable(),
  }),
});

export const updateNodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid node ID format'),
  }),
  body: z.object({
    title: z.string().max(300).optional().nullable(),
  }),
});

export const nodeParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid node ID format'),
  }),
});

export const createEdgeSchema = z.object({
  body: z.object({
    from_node_id: z.string().uuid('Invalid source node ID'),
    to_node_id: z.string().uuid('Invalid target node ID'),
    edge_type_code: z.nativeEnum(EdgeTypeCode),
    confidence: z.number().min(0).max(1).optional().nullable(),
    weight: z.number().min(0).max(1000).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const edgeParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Edge ID must be a number'),
  }),
});

export const traversalSchema = z.object({
  params: z.object({
    nodeId: z.string().uuid('Invalid node ID format'),
  }),
  query: z.object({
    direction: z.enum(['forward', 'backward', 'both']).optional(),
    depth: z.string().regex(/^\d+$/).optional(),
    filterNodeType: z.nativeEnum(NodeTypeCode).optional(),
    filterEdgeType: z.nativeEnum(EdgeTypeCode).optional(),
    minConfidence: z.string().regex(/^\d*\.?\d+$/).optional(),
  }),
});