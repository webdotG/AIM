import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    private analyticsService;
    constructor();
    getOverallStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEntriesByMonth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEmotionDistribution: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActivityHeatmap: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStreaks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const analyticsController: AnalyticsController;
//# sourceMappingURL=AnalyticsController.d.ts.map