import { Pool } from 'pg';
export declare class ThoughtsService {
    private pool;
    private nodesRepo;
    private thoughtsRepo;
    constructor(pool: Pool);
    createThought(userId: number, data: {
        title?: string;
        content: string;
        importance?: number | null;
        confidence?: number | null;
    }): Promise<{
        node: any;
        thought: any;
    }>;
    getThoughts(userId: number, filters?: {
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
    getThoughtById(nodeId: string, userId: number): Promise<{
        node: any;
        thought: any;
    }>;
    updateThought(nodeId: string, userId: number, updates: {
        title?: string;
        content?: string;
        importance?: number | null;
        confidence?: number | null;
    }): Promise<{
        node: any;
        thought: any;
    }>;
    deleteThought(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=ThoughtsService.d.ts.map