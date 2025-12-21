"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timelineSchema = exports.distributionSchema = exports.mostFrequentSchema = exports.emotionStatsSchema = exports.emotionCategorySchema = exports.entryIdParamSchema = exports.attachEmotionsSchema = void 0;
// Обновленный emotion.schema.ts
const zod_1 = require("zod");
// Вспомогательная схема для даты
const dateStringSchema = zod_1.z.string().refine(val => {
    if (!val)
        return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: 'Invalid date format'
});
const emotionItemSchema = zod_1.z.object({
    emotion_id: zod_1.z.number().int().positive().optional(),
    emotion_category: zod_1.z.enum(['positive', 'negative', 'neutral']).optional(),
    intensity: zod_1.z.number().int().min(1).max(10)
});
exports.attachEmotionsSchema = zod_1.z.object({
    body: zod_1.z.object({
        emotions: zod_1.z.array(emotionItemSchema)
            .min(1, 'At least one emotion must be provided')
            .refine(emotions => emotions.every(emotion => emotion.emotion_id || emotion.emotion_category), {
            message: 'Each emotion must have either emotion_id or emotion_category'
        })
    })
});
exports.entryIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        entryId: zod_1.z.string().uuid('Invalid entry ID format')
    })
});
// Новая схема для категории
exports.emotionCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        category: zod_1.z.enum(['positive', 'negative', 'neutral'])
    })
});
// Схема для статистики
exports.emotionStatsSchema = zod_1.z.object({
    query: zod_1.z.object({
        start_date: dateStringSchema.optional(),
        end_date: dateStringSchema.optional(),
        min_intensity: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 1)
            .optional()
            .default(1)
    })
});
// Схема для самых частых эмоций
exports.mostFrequentSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 10)
            .optional()
            .default(10),
        start_date: dateStringSchema.optional(),
        end_date: dateStringSchema.optional()
    })
});
// Схема для распределения
exports.distributionSchema = zod_1.z.object({
    query: zod_1.z.object({
        group_by: zod_1.z.enum(['category', 'intensity', 'month']).optional().default('category'),
        start_date: dateStringSchema.optional(),
        end_date: dateStringSchema.optional()
    })
});
// Схема для timeline
exports.timelineSchema = zod_1.z.object({
    query: zod_1.z.object({
        emotion_id: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        category: zod_1.z.enum(['positive', 'negative', 'neutral']).optional(),
        start_date: dateStringSchema.optional(),
        end_date: dateStringSchema.optional()
    })
});
