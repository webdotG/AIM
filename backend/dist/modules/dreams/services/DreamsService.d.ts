import { Pool } from 'pg';
export declare class DreamsService {
    private pool;
    private nodesRepo;
    private dreamsRepo;
    constructor(pool: Pool);
    createDream(userId: number, data: {
        title?: string;
        content: string;
        dream_date?: Date | null;
        lucidity?: number | null;
        vividness?: number | null;
        nightmare?: boolean;
        sleep_start?: Date | null;
        sleep_end?: Date | null;
    }): Promise<{
        node: any;
        dream: any;
    }>;
    getDreams(userId: number, filters?: {
        from_date?: string;
        to_date?: string;
        nightmare?: boolean;
    }, page?: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDreamById(nodeId: string, userId: number): Promise<{
        node: any;
        dream: any;
    }>;
    updateDream(nodeId: string, userId: number, updates: {
        title?: string;
        content?: string;
        dream_date?: Date | null;
        lucidity?: number | null;
        vividness?: number | null;
        nightmare?: boolean;
        sleep_start?: Date | null;
        sleep_end?: Date | null;
    }): Promise<{
        node: any;
        dream: any;
    }>;
    deleteDream(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=DreamsService.d.ts.map