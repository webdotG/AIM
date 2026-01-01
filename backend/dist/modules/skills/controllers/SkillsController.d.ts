import { Request, Response, NextFunction } from 'express';
export declare class SkillsController {
    private skillsService;
    constructor();
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addProgress: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProgressHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopSkills: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const skillsController: SkillsController;
//# sourceMappingURL=SkillsController.d.ts.map