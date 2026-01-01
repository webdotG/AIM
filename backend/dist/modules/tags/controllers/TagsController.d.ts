import { Request, Response, NextFunction } from 'express';
export declare class TagsController {
    private tagsService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getForEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    attachToEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    detachFromEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEntriesByTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostUsed: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnused: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findOrCreate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSimilar: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const tagsController: TagsController;
//# sourceMappingURL=TagsController.d.ts.map