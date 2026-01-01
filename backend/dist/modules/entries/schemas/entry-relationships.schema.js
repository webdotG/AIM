"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPersonSchema = exports.addTagSchema = exports.addEmotionSchema = void 0;
// src/modules/entries/schemas/entry-relationships.schema.ts
const zod_1 = require("zod");
exports.addEmotionSchema = zod_1.z.object({
    body: zod_1.z.object({
        emotion_id: zod_1.z.number().int().positive('Emotion ID must be a positive integer'),
        intensity: zod_1.z.number().int().min(1).max(10, 'Intensity must be between 1 and 10'),
    })
});
exports.addTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        tag_id: zod_1.z.number().int().positive('Tag ID must be a positive integer'),
    })
});
exports.addPersonSchema = zod_1.z.object({
    body: zod_1.z.object({
        person_id: zod_1.z.number().int().positive('Person ID must be a positive integer'),
        role: zod_1.z.string().max(50).optional(),
    })
});
//# sourceMappingURL=entry-relationships.schema.js.map