import { Request, Response, NextFunction } from 'express';
export declare class EntriesController {
    private entryService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addEmotion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addPerson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const entriesController: EntriesController;
//# sourceMappingURL=EntriesController.d.ts.map