import { z } from 'zod';
export declare const createRelationSchema: z.ZodObject<{
    body: z.ZodObject<{
        from_entry_id: z.ZodString;
        to_entry_id: z.ZodString;
        relation_type: z.ZodEnum<{
            resulted_in: "resulted_in";
            reminded_of: "reminded_of";
            related_to: "related_to";
            led_to: "led_to";
            inspired_by: "inspired_by";
            caused_by: "caused_by";
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
            both: "both";
            forward: "forward";
            backward: "backward";
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
            resulted_in: "resulted_in";
            reminded_of: "reminded_of";
            related_to: "related_to";
            led_to: "led_to";
            inspired_by: "inspired_by";
            caused_by: "caused_by";
            all: "all";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=relation.schema.d.ts.map