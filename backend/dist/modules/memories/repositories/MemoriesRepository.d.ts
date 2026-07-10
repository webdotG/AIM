import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class MemoriesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any | null>;
    create(nodeId: string, data: {
        content: string;
        event_date?: Date | null;
        confidence?: number | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        content: string;
        event_date: Date | null;
        confidence: number | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=MemoriesRepository.d.ts.map