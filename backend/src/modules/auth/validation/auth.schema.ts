// src/modules/auth/validation/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  login: z.string()
    .min(3, 'Login must be at least 3 characters')
    .max(50, 'Login must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Login can only contain letters, numbers and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export const updatePasswordSchema = z.object({
  backupCode: z.string(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;