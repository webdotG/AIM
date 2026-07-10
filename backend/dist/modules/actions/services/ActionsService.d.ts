import { Pool } from 'pg';
export declare class ActionsService {
    private pool;
    private nodesRepo;
    private actionsRepo;
    constructor(pool: Pool);
    createAction(userId: number, data: {
        title?: string;
        description?: string;
        activity_id?: number | null;
        started_at?: Date | null;
        finished_at?: Date | null;
    }): Promise<{
        node: any;
        action: any;
    }>;
    getActions(userId: number, filters?: {
        from_date?: string;
        to_date?: string;
        search?: string;
    }, page?: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getActionById(nodeId: string, userId: number): Promise<{
        node: any;
        action: any;
    }>;
    updateAction(nodeId: string, userId: number, updates: any): Promise<{
        node: any;
        action: any;
    }>;
    deleteAction(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=ActionsService.d.ts.map