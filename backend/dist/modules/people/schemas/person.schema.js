"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mostMentionedSchema = exports.getPeopleSchema = exports.personIdSchema = exports.updatePersonSchema = exports.createPersonSchema = void 0;
const zod_1 = require("zod");
exports.createPersonSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        category: zod_1.z.enum(['family', 'friends', 'acquaintances', 'strangers']),
        relationship: zod_1.z.string().max(100).optional().nullable(),
        bio: zod_1.z.string().optional().nullable(),
        birth_date: zod_1.z.string()
            .refine(val => !val || !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
        })
            .optional()
            .nullable(),
        notes: zod_1.z.string().optional().nullable()
    })
});
exports.updatePersonSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        category: zod_1.z.enum(['family', 'friends', 'acquaintances', 'strangers']).optional(),
        relationship: zod_1.z.string().max(100).optional().nullable(),
        bio: zod_1.z.string().optional().nullable(),
        birth_date: zod_1.z.string()
            .refine(val => !val || !isNaN(Date.parse(val)), {
            message: 'Invalid date format'
        })
            .optional()
            .nullable(),
        notes: zod_1.z.string().optional().nullable()
    })
});
exports.personIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.getPeopleSchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.enum(['family', 'friends', 'acquaintances', 'strangers']).optional(),
        search: zod_1.z.string().optional(),
        sort: zod_1.z.enum(['name', 'mentions', 'created_at']).optional().default('name'),
        page: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional()
    })
});
exports.mostMentionedSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 10)
            .optional()
            .default(10),
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
