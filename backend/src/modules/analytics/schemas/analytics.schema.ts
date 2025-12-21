import { z } from 'zod';

// Вспомогательная схема для даты
const dateStringSchema = z.string().refine(val => {
  if (!val) return true;
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: 'Invalid date format'
});

// Схема для общей статистики (без параметров)
export const overallStatsSchema = z.object({
  query: z.object({})
});

// Схема для записей по месяцам
export const entriesByMonthSchema = z.object({
  query: z.object({
    months: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 12)
      .optional()
      .default(12) // Число!
  })
});

// Схема для распределения эмоций
export const emotionDistributionSchema = z.object({
  query: z.object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional()
  })
});

// Схема для heatmap активности
export const activityHeatmapSchema = z.object({
  query: z.object({
    year: z.string()
      .regex(/^\d{4}$/)
      .transform(val => val ? parseInt(val, 10) : new Date().getFullYear())
      .optional()
      .default(new Date().getFullYear())
  })
});

// Схема для серий (streaks)
export const streaksSchema = z.object({
  query: z.object({})
});

// Типы для TypeScript
export type OverallStatsInput = z.infer<typeof overallStatsSchema>;
export type EntriesByMonthInput = z.infer<typeof entriesByMonthSchema>;
export type EmotionDistributionInput = z.infer<typeof emotionDistributionSchema>;
export type ActivityHeatmapInput = z.infer<typeof activityHeatmapSchema>;
export type StreaksInput = z.infer<typeof streaksSchema>;