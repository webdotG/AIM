import { z } from 'zod';
export declare const addEmotionSchema: z.ZodObject<{
    body: z.ZodObject<{
        emotion_id: z.ZodNumber;
        intensity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addTagSchema: z.ZodObject<{
    body: z.ZodObject<{
        tag_id: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addPersonSchema: z.ZodObject<{
    body: z.ZodObject<{
        person_id: z.ZodNumber;
        role: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=entry-relationships.schema.d.ts.map