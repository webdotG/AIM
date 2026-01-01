import { Request, Response, NextFunction } from 'express';
export declare class CircumstancesController {
    private circumstancesService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWeatherStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMoonPhaseStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const circumstancesController: CircumstancesController;
//# sourceMappingURL=CircumstancesController.d.ts.map