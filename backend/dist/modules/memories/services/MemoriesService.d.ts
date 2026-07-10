import { Pool } from 'pg';
export declare class MemoriesService {
    private pool;
    private nodesRepo;
    private memoriesRepo;
    constructor(pool: Pool);
    createMemory(userId: number, data: {
        title?: string;
        content: string;
        event_date?: Date | null;
        confidence?: number | null;
    }): Promise<{
        node: any;
        memory: any;
    }>;
    getMemories(userId: number, filters?: {
        from_date?: string;
        to_date?: string;
        search?: string;
    }, page?: number, limit?: number): Promise<{
        data: {
            node: any;
            memory: {
                content: any;
                event_date: any;
                confidence: any;
                deleted_at: any;
                node_id: any;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMemoryById(nodeId: string, userId: number): Promise<{
        node: any;
        memory: any;
    }>;
    updateMemory(nodeId: string, userId: number, updates: {
        title?: string;
        content?: string;
        event_date?: Date | null;
        confidence?: number | null;
    }): Promise<{
        node: any;
        memory: any;
    }>;
    deleteMemory(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=MemoriesService.d.ts.map