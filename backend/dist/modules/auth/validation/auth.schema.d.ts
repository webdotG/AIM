import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    login: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    login: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updatePasswordSchema: z.ZodObject<{
    backupCode: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const checkPasswordStrengthSchema: z.ZodObject<{
    password: z.ZodString;
}, z.core.$strip>;
export type CheckPasswordStrengthInput = z.infer<typeof checkPasswordStrengthSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
//# sourceMappingURL=auth.schema.d.ts.map