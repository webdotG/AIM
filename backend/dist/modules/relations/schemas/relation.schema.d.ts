import { z } from 'zod';
export declare const createRelationSchema: z.ZodObject<{
    body: z.ZodObject<{
        from_entry_id: z.ZodString;
        to_entry_id: z.ZodString;
        relation_type: z.ZodEnum<{
            led_to: "led_to";
            reminded_of: "reminded_of";
            inspired_by: "inspired_by";
            caused_by: "caused_by";
            related_to: "related_to";
            resulted_in: "resulted_in";
        }>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const relationIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const entryIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        entryId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getChainSchema: z.ZodObject<{
    params: z.ZodObject<{
        entryId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        depth: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            forward: "forward";
            backward: "backward";
            both: "both";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const mostConnectedSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        min_connections: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const graphSchema: z.ZodObject<{
    query: z.ZodObject<{
        max_depth: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        entry_id: z.ZodOptional<z.ZodString>;
        relation_type: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            led_to: "led_to";
            reminded_of: "reminded_of";
            inspired_by: "inspired_by";
            caused_by: "caused_by";
            related_to: "related_to";
            resulted_in: "resulted_in";
            all: "all";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=relation.schema.d.ts.map