import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    private service;
    constructor();
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEntriesByMonth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEmotionDistribution: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActivityHeatmap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStreaks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEmotionTimeline: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNodeConnections: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const analyticsController: AnalyticsController;
//# sourceMappingURL=AnalyticsController.d.ts.map