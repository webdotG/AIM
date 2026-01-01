import { z } from 'zod';
export declare const attachEmotionsSchema: z.ZodObject<{
    body: z.ZodObject<{
        emotions: z.ZodArray<z.ZodObject<{
            emotion_id: z.ZodOptional<z.ZodNumber>;
            emotion_category: z.ZodOptional<z.ZodEnum<{
                positive: "positive";
                negative: "negative";
                neutral: "neutral";
            }>>;
            intensity: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const entryIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        entryId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const emotionCategorySchema: z.ZodObject<{
    params: z.ZodObject<{
        category: z.ZodEnum<{
            positive: "positive";
            negative: "negative";
            neutral: "neutral";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const emotionStatsSchema: z.ZodObject<{
    query: z.ZodObject<{
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
        min_intensity: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const mostFrequentSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const distributionSchema: z.ZodObject<{
    query: z.ZodObject<{
        group_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            intensity: "intensity";
            month: "month";
            category: "category";
        }>>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const timelineSchema: z.ZodObject<{
    query: z.ZodObject<{
        emotion_id: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        category: z.ZodOptional<z.ZodEnum<{
            positive: "positive";
            negative: "negative";
            neutral: "neutral";
        }>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AttachEmotionsInput = z.infer<typeof attachEmotionsSchema>;
export type EmotionStatsInput = z.infer<typeof emotionStatsSchema>;
export type MostFrequentInput = z.infer<typeof mostFrequentSchema>;
export type DistributionInput = z.infer<typeof distributionSchema>;
export type TimelineInput = z.infer<typeof timelineSchema>;
//# sourceMappingURL=emotion.schema.d.ts.map