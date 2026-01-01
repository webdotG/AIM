import { z } from 'zod';
export declare const createTagSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateTagSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const attachTagsSchema: z.ZodObject<{
    body: z.ZodObject<{
        tags: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const entryIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        entryId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getTagsSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            name: "name";
            created_at: "created_at";
            usage: "usage";
        }>>>;
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const mostUsedSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        min_usage: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const unusedSchema: z.ZodObject<{
    query: z.ZodObject<{
        older_than_days: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const entriesByTagSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        entry_type: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            dream: "dream";
            memory: "memory";
            thought: "thought";
            plan: "plan";
            all: "all";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const similarTagsSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        min_similarity: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=tag.schema.d.ts.map