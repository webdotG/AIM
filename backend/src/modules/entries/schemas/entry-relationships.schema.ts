// src/modules/entries/schemas/entry-relationships.schema.ts
import { z } from 'zod';

export const addEmotionSchema = z.object({
  body: z.object({
    emotion_id: z.number().int().positive('Emotion ID must be a positive integer'),
    intensity: z.number().int().min(1).max(10, 'Intensity must be between 1 and 10'),
  })
});

export const addTagSchema = z.object({
  body: z.object({
    tag_id: z.number().int().positive('Tag ID must be a positive integer'),
  })
});

export const addPersonSchema = z.object({
  body: z.object({
    person_id: z.number().int().positive('Person ID must be a positive integer'),
    role: z.string().max(50).optional(),
  })
});