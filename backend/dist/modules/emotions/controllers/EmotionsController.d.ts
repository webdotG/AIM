import { Request, Response, NextFunction } from 'express';
export declare class EmotionsController {
    private emotionsService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getByCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getForEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    attachToEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    detachFromEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostFrequent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDistribution: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTimeline: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const emotionsController: EmotionsController;
//# sourceMappingURL=EmotionsController.d.ts.map