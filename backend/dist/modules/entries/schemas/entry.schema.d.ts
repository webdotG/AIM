import { z } from 'zod';
export declare const createEntrySchema: z.ZodObject<{
    body: z.ZodObject<{
        entry_type: z.ZodEnum<{
            dream: "dream";
            memory: "memory";
            thought: "thought";
            plan: "plan";
        }>;
        content: z.ZodString;
        body_state_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        circumstance_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        deadline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        is_completed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        emotions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emotion_id: z.ZodNumber;
            intensity: z.ZodNumber;
        }, z.core.$strip>>>;
        people: z.ZodOptional<z.ZodArray<z.ZodObject<{
            person_id: z.ZodNumber;
            role: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEntrySchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        body_state_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        circumstance_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        deadline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        is_completed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const entryIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getEntriesSchema: z.ZodObject<{
    query: z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<{
            dream: "dream";
            memory: "memory";
            thought: "thought";
            plan: "plan";
        }>>;
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        search: z.ZodOptional<z.ZodString>;
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=entry.schema.d.ts.map