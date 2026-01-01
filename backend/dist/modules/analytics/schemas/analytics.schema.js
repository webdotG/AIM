"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streaksSchema = exports.activityHeatmapSchema = exports.emotionDistributionSchema = exports.entriesByMonthSchema = exports.overallStatsSchema = void 0;
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
// Схема для общей статистики (без параметров)
exports.overallStatsSchema = zod_1.z.object({
    query: zod_1.z.object({})
});
// Схема для записей по месяцам
exports.entriesByMonthSchema = zod_1.z.object({
    query: zod_1.z.object({
        months: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 12)
            .optional()
            .default(12) // Число!
    })
});
// Схема для распределения эмоций
exports.emotionDistributionSchema = zod_1.z.object({
    query: zod_1.z.object({
        from: dateStringSchema.optional(),
        to: dateStringSchema.optional()
    })
});
// Схема для heatmap активности
exports.activityHeatmapSchema = zod_1.z.object({
    query: zod_1.z.object({
        year: zod_1.z.string()
            .regex(/^\d{4}$/)
            .transform(val => val ? parseInt(val, 10) : new Date().getFullYear())
            .optional()
            .default(new Date().getFullYear())
    })
});
// Схема для серий (streaks)
exports.streaksSchema = zod_1.z.object({
    query: zod_1.z.object({})
});
//# sourceMappingURL=analytics.schema.js.map