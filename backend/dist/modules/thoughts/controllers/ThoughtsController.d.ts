import { Request, Response, NextFunction } from 'express';
export declare class ThoughtsController {
    private service;
    constructor();
    getThoughts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getThoughtById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createThought: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateThought: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteThought: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const thoughtsController: ThoughtsController;
//# sourceMappingURL=ThoughtsController.d.ts.map