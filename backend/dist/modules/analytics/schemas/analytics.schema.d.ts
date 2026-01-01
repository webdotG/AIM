import { z } from 'zod';
export declare const overallStatsSchema: z.ZodObject<{
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export declare const entriesByMonthSchema: z.ZodObject<{
    query: z.ZodObject<{
        months: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const emotionDistributionSchema: z.ZodObject<{
    query: z.ZodObject<{
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const activityHeatmapSchema: z.ZodObject<{
    query: z.ZodObject<{
        year: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const streaksSchema: z.ZodObject<{
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export type OverallStatsInput = z.infer<typeof overallStatsSchema>;
export type EntriesByMonthInput = z.infer<typeof entriesByMonthSchema>;
export type EmotionDistributionInput = z.infer<typeof emotionDistributionSchema>;
export type ActivityHeatmapInput = z.infer<typeof activityHeatmapSchema>;
export type StreaksInput = z.infer<typeof streaksSchema>;
//# sourceMappingURL=analytics.schema.d.ts.map