import { Request, Response, NextFunction } from 'express';
export declare class TagsController {
    private service;
    constructor();
    getTags: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTagById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findOrCreate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNodesByTag: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTagsForNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    replaceTagsForNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostUsed: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnused: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const tagsController: TagsController;
//# sourceMappingURL=TagsController.d.ts.map