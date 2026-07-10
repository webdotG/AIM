import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class TraversalRepository extends BaseRepository {
    constructor(pool: Pool);
    traverse(startNodeId: string, userId: number, options?: {
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
}
//# sourceMappingURL=TraversalRepository.d.ts.map