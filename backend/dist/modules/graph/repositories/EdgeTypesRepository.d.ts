import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { EdgeType } from '../../../shared/types';
export declare class EdgeTypesRepository extends BaseRepository {
    constructor(pool: Pool);
    findAll(): Promise<EdgeType[]>;
    findById(id: number): Promise<EdgeType | null>;
    findByCode(code: string): Promise<EdgeType | null>;
}
//# sourceMappingURL=EdgeTypesRepository.d.ts.map