import { Request, Response, NextFunction } from 'express';
export declare class PeopleController {
    private peopleService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostMentioned: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const peopleController: PeopleController;
//# sourceMappingURL=PeopleController.d.ts.map