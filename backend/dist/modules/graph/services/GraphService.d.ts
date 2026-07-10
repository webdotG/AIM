export declare class GraphService {
    private nodesRepo;
    private edgesRepo;
    private traversalRepo;
    private nodeTypesRepo;
    private edgeTypesRepo;
    constructor(pool: any);
    getNodes(userId: number, filters?: {
        node_type_code?: string;
        search?: string;
        from_date?: string;
        to_date?: string;
    }, page?: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getNodeById(nodeId: string, userId: number): Promise<any>;
    createNode(userId: number, nodeTypeCode: string, title?: string | null): Promise<any>;
    updateNode(nodeId: string, userId: number, updates: {
        title?: string | null;
    }): Promise<any>;
    deleteNode(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
    createEdge(userId: number, input: {
        from_node_id: string;
        to_node_id: string;
        edge_type_code: string;
        confidence?: number;
        weight?: number;
        notes?: string;
    }): Promise<any>;
    getEdgesForNode(nodeId: string, userId: number, direction?: 'outgoing' | 'incoming' | 'both'): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    deleteEdge(edgeId: number): Promise<{
        success: boolean;
    }>;
    traverseGraph(startNodeId: string, userId: number, options?: {
        direction?: 'forward' | 'backward' | 'both';
        depth?: number;
        filterNodeType?: string;
        filterEdgeType?: string;
        minConfidence?: number;
    }): Promise<{
        path: any[];
        edges: any[];
    }>;
    getNeighbors(nodeId: string, userId: number): Promise<any[]>;
    getGraphData(userId: number): Promise<{
        nodes: any[];
        edges: any[];
    }>;
    getMostConnected(userId: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getNodeTypes(): Promise<import("../../../shared/types").NodeType[]>;
    getEdgeTypes(): Promise<import("../../../shared/types").EdgeType[]>;
}
//# sourceMappingURL=GraphService.d.ts.map