import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        login: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        login: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updatePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        backupCode: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const recoverSchema: z.ZodObject<{
    body: z.ZodObject<{
        login: z.ZodString;
        backup_code: z.ZodString;
        new_password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];
//# sourceMappingURL=auth.schema.d.ts.map