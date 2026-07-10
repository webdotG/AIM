import { Pool } from 'pg';
export declare class PlansService {
    private pool;
    private nodesRepo;
    private plansRepo;
    constructor(pool: Pool);
    createPlan(userId: number, data: {
        title?: string;
        description: string;
        deadline?: Date | null;
        priority?: number | null;
    }): Promise<{
        node: any;
        plan: any;
    }>;
    getPlans(userId: number, filters?: {
        completed?: boolean;
        overdue?: boolean;
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
    getPlanById(nodeId: string, userId: number): Promise<{
        node: any;
        plan: any;
    }>;
    updatePlan(nodeId: string, userId: number, updates: {
        title?: string;
        description?: string;
        deadline?: Date | null;
        priority?: number | null;
        completed?: boolean;
    }): Promise<{
        node: any;
        plan: any;
    }>;
    deletePlan(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=PlansService.d.ts.map