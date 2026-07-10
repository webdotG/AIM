import { Request, Response, NextFunction } from 'express';
export declare class AIController {
    private service;
    constructor();
    requestAnalysis: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAnalysis: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requestImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const aiController: AIController;
//# sourceMappingURL=AIController.d.ts.map