import { Request, Response, NextFunction } from 'express';
export declare class DreamsController {
    private service;
    constructor();
    getDreams: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDreamById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createDream: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateDream: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteDream: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const dreamsController: DreamsController;
//# sourceMappingURL=DreamsController.d.ts.map