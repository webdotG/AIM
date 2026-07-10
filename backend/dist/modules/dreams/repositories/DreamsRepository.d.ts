import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class DreamsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any | null>;
    create(nodeId: string, data: {
        content: string;
        dream_date?: Date | null;
        lucidity?: number | null;
        vividness?: number | null;
        nightmare?: boolean;
        sleep_start?: Date | null;
        sleep_end?: Date | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        content: string;
        dream_date: Date | null;
        lucidity: number | null;
        vividness: number | null;
        nightmare: boolean;
        sleep_start: Date | null;
        sleep_end: Date | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=DreamsRepository.d.ts.map