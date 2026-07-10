import { Request, Response, NextFunction } from 'express';
export declare class MemoriesController {
    private service;
    constructor();
    getMemories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMemoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createMemory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMemory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMemory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const memoriesController: MemoriesController;
//# sourceMappingURL=MemoriesController.d.ts.map