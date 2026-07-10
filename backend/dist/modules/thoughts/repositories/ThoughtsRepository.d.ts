import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class ThoughtsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any | null>;
    create(nodeId: string, data: {
        content: string;
        importance?: number | null;
        confidence?: number | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        content: string;
        importance: number | null;
        confidence: number | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=ThoughtsRepository.d.ts.map