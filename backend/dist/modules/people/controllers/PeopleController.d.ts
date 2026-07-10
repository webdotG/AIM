import { Request, Response, NextFunction } from 'express';
export declare class PeopleController {
    private service;
    constructor();
    getPeople: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostMentioned: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPersonById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPerson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePerson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePerson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPersonContacts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const peopleController: PeopleController;
//# sourceMappingURL=PeopleController.d.ts.map