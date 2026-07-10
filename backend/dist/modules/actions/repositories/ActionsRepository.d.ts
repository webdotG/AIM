import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class ActionsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any>;
    create(nodeId: string, data: {
        description?: string;
        activity_id?: number | null;
        started_at?: Date | null;
        finished_at?: Date | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        description: string;
        activity_id: number | null;
        started_at: Date | null;
        finished_at: Date | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=ActionsRepository.d.ts.map