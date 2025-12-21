"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressHistorySchema = exports.topSkillsSchema = exports.addProgressSchema = exports.getSkillsSchema = exports.skillIdSchema = exports.updateSkillSchema = exports.createSkillSchema = void 0;
const zod_1 = require("zod");
exports.createSkillSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        category: zod_1.z.string().max(50).optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        icon: zod_1.z.string().max(50).optional().nullable(),
        color: zod_1.z.string().max(20).optional().nullable()
    })
});
exports.updateSkillSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        category: zod_1.z.string().max(50).optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        current_level: zod_1.z.number().int().min(1).max(100).optional(),
        experience_points: zod_1.z.number().int().min(0).optional(),
        icon: zod_1.z.string().max(50).optional().nullable(),
        color: zod_1.z.string().max(20).optional().nullable()
    })
});
exports.skillIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.getSkillsSchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.string().optional(),
        page: zod_1.z.string().regex(/^\d+$/).transform(val => val ? parseInt(val, 10) : undefined).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(val => val ? parseInt(val, 10) : undefined).optional(),
        sort: zod_1.z.enum(['level', 'experience', 'name', 'created_at']).optional()
    })
});
// Добавление прогресса к навыку
exports.addProgressSchema = zod_1.z.object({
    body: zod_1.z.object({
        entry_id: zod_1.z.string().uuid().optional().nullable(),
        body_state_id: zod_1.z.number().int().positive().optional().nullable(),
        progress_type: zod_1.z.enum(['practice', 'achievement', 'lesson', 'milestone']).default('practice'),
        experience_gained: zod_1.z.number().int().min(1).max(1000).default(10),
        notes: zod_1.z.string().optional().nullable()
    }).refine(data => data.entry_id || data.body_state_id, { message: 'Either entry_id or body_state_id must be provided' })
});
exports.topSkillsSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 10)
            .optional()
            .default(10),
        category: zod_1.z.string().optional(),
        min_level: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 1)
            .optional()
            .default(1)
    })
});
exports.progressHistorySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        progress_type: zod_1.z.enum(['practice', 'achievement', 'lesson', 'milestone', 'all'])
            .optional()
            .default('all'),
        start_date: zod_1.z.string()
            .refine(val => !val || !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
        })
            .optional(),
        end_date: zod_1.z.string()
            .refine(val => !val || !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
        })
            .optional()
    })
});
