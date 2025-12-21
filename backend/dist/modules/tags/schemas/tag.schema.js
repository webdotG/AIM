"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.similarTagsSchema = exports.entriesByTagSchema = exports.unusedSchema = exports.mostUsedSchema = exports.getTagsSchema = exports.entryIdParamSchema = exports.attachTagsSchema = exports.tagIdSchema = exports.updateTagSchema = exports.createTagSchema = void 0;
const zod_1 = require("zod");
exports.createTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(50).regex(/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/, 'Tag name can only contain letters, numbers, underscore and dash')
    })
});
exports.updateTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(50).regex(/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/, 'Tag name can only contain letters, numbers, underscore and dash')
    })
});
exports.tagIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.attachTagsSchema = zod_1.z.object({
    body: zod_1.z.object({
        tags: zod_1.z.array(zod_1.z.number().int().positive()).min(1, 'At least one tag must be provided')
    })
});
exports.entryIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        entryId: zod_1.z.string().uuid('Invalid entry ID format')
    })
});
exports.getTagsSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        sort: zod_1.z.enum(['name', 'usage', 'created_at']).optional().default('name'),
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
exports.mostUsedSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 10)
            .optional()
            .default(10),
        min_usage: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 1)
            .optional()
            .default(1)
    })
});
exports.unusedSchema = zod_1.z.object({
    query: zod_1.z.object({
        older_than_days: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 30)
            .optional()
            .default(30)
    })
});
exports.entriesByTagSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        entry_type: zod_1.z.enum(['dream', 'memory', 'thought', 'plan', 'all'])
            .optional()
            .default('all')
    })
});
exports.similarTagsSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 5)
            .optional()
            .default(5),
        min_similarity: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 1)
            .optional()
            .default(1)
    })
});
