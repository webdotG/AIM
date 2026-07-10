import { z } from 'zod';
import { NodeTypeCode, EdgeTypeCode } from '../../../shared/types';
export declare const createNodeSchema: z.ZodObject<{
    body: z.ZodObject<{
        node_type_code: z.ZodEnum<typeof NodeTypeCode>;
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateNodeSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const nodeParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createEdgeSchema: z.ZodObject<{
    body: z.ZodObject<{
        from_node_id: z.ZodString;
        to_node_id: z.ZodString;
        edge_type_code: z.ZodEnum<typeof EdgeTypeCode>;
        confidence: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        weight: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const edgeParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const traversalSchema: z.ZodObject<{
    params: z.ZodObject<{
        nodeId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        direction: z.ZodOptional<z.ZodEnum<{
            both: "both";
            forward: "forward";
            backward: "backward";
        }>>;
        depth: z.ZodOptional<z.ZodString>;
        filterNodeType: z.ZodOptional<z.ZodEnum<typeof NodeTypeCode>>;
        filterEdgeType: z.ZodOptional<z.ZodEnum<typeof EdgeTypeCode>>;
        minConfidence: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=graph.schema.d.ts.map