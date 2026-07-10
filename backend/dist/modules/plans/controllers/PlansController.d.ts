import { Request, Response, NextFunction } from 'express';
export declare class PlansController {
    private service;
    constructor();
    getPlans: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPlanById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePlan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const plansController: PlansController;
//# sourceMappingURL=PlansController.d.ts.map