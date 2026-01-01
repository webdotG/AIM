import { Request, Response, NextFunction } from 'express';
export declare class HCaptchaMiddleware {
    private readonly secretKey;
    private readonly verifyUrl;
    private readonly enabled;
    constructor();
    verify: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private getErrorMessage;
}
export declare const hcaptchaMiddleware: HCaptchaMiddleware;
//# sourceMappingURL=hcaptcha.middleware.d.ts.map