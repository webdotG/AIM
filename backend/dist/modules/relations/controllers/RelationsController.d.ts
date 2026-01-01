import { Request, Response, NextFunction } from 'express';
export declare class RelationsController {
    private relationsService;
    constructor();
    getForEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getChain: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTypes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostConnected: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getGraph: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const relationsController: RelationsController;
//# sourceMappingURL=RelationsController.d.ts.map