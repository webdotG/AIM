import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class PlansRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any | null>;
    create(nodeId: string, data: {
        description: string;
        deadline?: Date | null;
        priority?: number | null;
        completed?: boolean;
        completed_at?: Date | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        description: string;
        deadline: Date | null;
        priority: number | null;
        completed: boolean;
        completed_at: Date | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=PlansRepository.d.ts.map