import { z } from 'zod';

export const attachEmotionsSchema = z.object({
  body: z.object({
    emotions: z.array(
      z.object({
        emotion_id: z.number().int().positive().optional(),
        emotion_category: z.enum(['positive', 'negative', 'neutral']).optional(),
        intensity: z.number().int().min(1).max(10)
      }).refine(
        data => data.emotion_id || data.emotion_category,
        { message: 'Either emotion_id or emotion_category must be provided' }
      )
    ).min(1, 'At least one emotion must be provided')
  })
});

export const entryIdParamSchema = z.object({
  params: z.object({
    entryId: z.string().uuid('Invalid entry ID format')
  })
});
