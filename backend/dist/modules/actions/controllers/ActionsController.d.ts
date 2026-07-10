import { Request, Response, NextFunction } from 'express';
export declare class ActionsController {
    private service;
    constructor();
    getActions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createAction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const actionsController: ActionsController;
//# sourceMappingURL=ActionsController.d.ts.map