"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphSchema = exports.mostConnectedSchema = exports.getChainSchema = exports.entryIdSchema = exports.relationIdSchema = exports.createRelationSchema = void 0;
const zod_1 = require("zod");
exports.createRelationSchema = zod_1.z.object({
    body: zod_1.z.object({
        from_entry_id: zod_1.z.string().uuid('Invalid from_entry_id format'),
        to_entry_id: zod_1.z.string().uuid('Invalid to_entry_id format'),
        relation_type: zod_1.z.enum(['led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in']),
        description: zod_1.z.string().max(500).optional().nullable()
    }).refine(data => data.from_entry_id !== data.to_entry_id, { message: 'Entry cannot be related to itself' })
});
exports.relationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.entryIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        entryId: zod_1.z.string().uuid('Invalid entry ID format')
    })
});
exports.getChainSchema = zod_1.z.object({
    params: zod_1.z.object({
        entryId: zod_1.z.string().uuid('Invalid entry ID format')
    }),
    query: zod_1.z.object({
        depth: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => parseInt(val, 10))
            .optional()
            .default(10),
        direction: zod_1.z.enum(['forward', 'backward', 'both']).optional().default('both')
    })
});
exports.mostConnectedSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 10)
            .optional()
            .default(10),
        min_connections: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 1)
            .optional()
            .default(1)
    })
});
exports.graphSchema = zod_1.z.object({
    query: zod_1.z.object({
        max_depth: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : 3)
            .optional()
            .default(3),
        entry_id: zod_1.z.string().uuid('Invalid entry ID format').optional(),
        relation_type: zod_1.z.enum(['led_to', 'reminded_of', 'inspired_by', 'caused_by', 'related_to', 'resulted_in', 'all'])
            .optional()
            .default('all')
    })
});
//# sourceMappingURL=relation.schema.js.map