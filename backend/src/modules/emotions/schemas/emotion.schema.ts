// Обновленный emotion.schema.ts
import { z } from 'zod';

// Вспомогательная схема для даты
const dateStringSchema = z.string().refine(val => {
  if (!val) return true;
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: 'Invalid date format'
});

const emotionItemSchema = z.object({
  emotion_id: z.number().int().positive().optional(),
  emotion_category: z.enum(['positive', 'negative', 'neutral']).optional(),
  intensity: z.number().int().min(1).max(10)
});

export const attachEmotionsSchema = z.object({
  body: z.object({
    emotions: z.array(emotionItemSchema)
      .min(1, 'At least one emotion must be provided')
      .refine(
        emotions => emotions.every(emotion => 
          emotion.emotion_id || emotion.emotion_category
        ),
        { 
          message: 'Each emotion must have either emotion_id or emotion_category' 
        }
      )
  })
});

export const entryIdParamSchema = z.object({
  params: z.object({
    entryId: z.string().uuid('Invalid entry ID format')
  })
});

// Новая схема для категории
export const emotionCategorySchema = z.object({
  params: z.object({
    category: z.enum(['positive', 'negative', 'neutral'])
  })
});

// Схема для статистики
export const emotionStatsSchema = z.object({
  query: z.object({
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
    min_intensity: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 1)
      .optional()
      .default(1)
  })
});

// Схема для самых частых эмоций
export const mostFrequentSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 10)
      .optional()
      .default(10),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional()
  })
});

// Схема для распределения
export const distributionSchema = z.object({
  query: z.object({
    group_by: z.enum(['category', 'intensity', 'month']).optional().default('category'),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional()
  })
});

// Схема для timeline
export const timelineSchema = z.object({
  query: z.object({
    emotion_id: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    category: z.enum(['positive', 'negative', 'neutral']).optional(),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional()
  })
});

// Типы
export type AttachEmotionsInput = z.infer<typeof attachEmotionsSchema>;
export type EmotionStatsInput = z.infer<typeof emotionStatsSchema>;
export type MostFrequentInput = z.infer<typeof mostFrequentSchema>;
export type DistributionInput = z.infer<typeof distributionSchema>;
export type TimelineInput = z.infer<typeof timelineSchema>;