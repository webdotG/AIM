import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class MeasurementsRepository extends BaseRepository {
    constructor(pool: Pool);
    create(nodeId: string, input: {
        measurement_id: number;
        value_integer?: number;
        value_decimal?: number;
        value_boolean?: boolean;
        value_text?: string;
        unit?: string;
    }): Promise<any>;
    findByNodeId(nodeId: string): Promise<any[]>;
    deleteByNodeId(nodeId: string): Promise<number>;
}
//# sourceMappingURL=MeasurementsRepository.d.ts.map