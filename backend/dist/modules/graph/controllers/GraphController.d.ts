import { Request, Response, NextFunction } from 'express';
export declare class GraphController {
    private service;
    constructor();
    getNodes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNodeById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteNode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createEdge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEdgesForNode: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteEdge: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    traverseGraph: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getNeighbors: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getGraphData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMostConnected: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNodeTypes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEdgeTypes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const graphController: GraphController;
//# sourceMappingURL=GraphController.d.ts.map