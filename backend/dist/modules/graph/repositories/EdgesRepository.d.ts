import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class EdgesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNode(nodeId: string, direction?: 'outgoing' | 'incoming' | 'both'): Promise<any[]>;
    create(fromNodeId: string, toNodeId: string, edgeTypeCode: string, confidence?: number | null, weight?: number | null, notes?: string | null): Promise<any>;
    softDelete(id: number): Promise<any>;
    findChain(startNodeId: string, direction?: 'forward' | 'backward' | 'both', depth?: number): Promise<any[]>;
    getGraphData(userId: number): Promise<{
        nodes: any[];
        edges: any[];
    }>;
    getMostConnected(userId: number, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=EdgesRepository.d.ts.map