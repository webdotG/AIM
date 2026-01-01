import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    updatePassword: (req: Request, res: Response) => Promise<void>;
    verify: (req: Request, res: Response) => Promise<void>;
    recover: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkPasswordStrength: (req: Request, res: Response) => Promise<void>;
    generatePasswordRecommendation: (req: Request, res: Response) => Promise<void>;
}
export declare const authController: any;
//# sourceMappingURL=AuthController.d.ts.map