"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
// src/modules/auth/validation/auth.schema.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    login: zod_1.z.string()
        .min(3, 'Login must be at least 3 characters')
        .max(50, 'Login must be at most 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Login can only contain letters, numbers and underscores'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long'),
});
exports.loginSchema = zod_1.z.object({
    login: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.updatePasswordSchema = zod_1.z.object({
    backupCode: zod_1.z.string(),
    newPassword: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long'),
});
