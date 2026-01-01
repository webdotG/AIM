"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntriesSchema = exports.entryIdSchema = exports.updateEntrySchema = exports.createEntrySchema = void 0;
const zod_1 = require("zod");
// для валидации дат
const dateStringSchema = zod_1.z.string().refine(val => {
    if (!val)
        return true; // пустые значения
    const date = new Date(val);
    return !isNaN(date.getTime()) && val.includes('T') === false; // дата без времени
}, {
    message: 'Invalid date format (expected YYYY-MM-DD)'
});
const datetimeStringSchema = zod_1.z.string().refine(val => {
    if (!val)
        return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: 'Invalid datetime format'
});
exports.createEntrySchema = zod_1.z.object({
    body: zod_1.z.object({
        entry_type: zod_1.z.enum(['dream', 'memory', 'thought', 'plan']),
        content: zod_1.z.string().min(1, "Content is required"),
        // ОПЦИОНАЛЬНЫЕ СВЯЗИ
        body_state_id: zod_1.z.number().int().positive().optional().nullable(),
        circumstance_id: zod_1.z.number().int().positive().optional().nullable(),
        // ДЛЯ ПЛАНОВ
        deadline: dateStringSchema.optional().nullable(),
        is_completed: zod_1.z.boolean().optional().default(false),
        // СВЯЗАННЫЕ СУЩНОСТИ
        emotions: zod_1.z.array(zod_1.z.object({
            emotion_id: zod_1.z.number().int().positive(),
            intensity: zod_1.z.number().int().min(1).max(10)
        })).optional(),
        people: zod_1.z.array(zod_1.z.object({
            person_id: zod_1.z.number().int().positive(),
            role: zod_1.z.string().optional()
        })).optional(),
        tags: zod_1.z.array(zod_1.z.number().int().positive()).optional()
    })
});
exports.updateEntrySchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).optional(),
        body_state_id: zod_1.z.number().int().positive().optional().nullable(),
        circumstance_id: zod_1.z.number().int().positive().optional().nullable(),
        deadline: dateStringSchema.optional().nullable(),
        is_completed: zod_1.z.boolean().optional()
    })
});
exports.entryIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid entry ID format")
    })
});
exports.getEntriesSchema = zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z.enum(['dream', 'memory', 'thought', 'plan']).optional(),
        page: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        search: zod_1.z.string().optional(),
        from: datetimeStringSchema.optional(),
        to: datetimeStringSchema.optional()
    })
});
//# sourceMappingURL=entry.schema.js.map