import { z } from 'zod';

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