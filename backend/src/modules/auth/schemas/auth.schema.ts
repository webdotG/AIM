import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    login: z.string()
      .min(3, 'Login must be at least 3 characters')
      .max(50, 'Login must be at most 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Login can only contain letters, numbers and underscores'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
  })
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string(),
    password: z.string(),
  })
});

export const updatePasswordSchema = z.object({
  body: z.object({
    backupCode: z.string(),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
  })
});

export const recoverSchema = z.object({
  body: z.object({
    login: z.string().min(1, 'Login is required'),
    backup_code: z.string().min(1, 'Backup code is required'),
    new_password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/\d/, 'Password must contain number')
  })
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];