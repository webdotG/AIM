"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntrySchema = void 0;
const zod_1 = require("zod");
exports.createEntrySchema = zod_1.z.object({
    body: zod_1.z.object({
        entry_type: zod_1.z.enum(['dream', 'memory', 'thought', 'plan']),
        content: zod_1.z.string().min(1, "Content is required"),
        event_date: zod_1.z.string().datetime().optional(),
        deadline: zod_1.z.string().datetime().optional(),
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
