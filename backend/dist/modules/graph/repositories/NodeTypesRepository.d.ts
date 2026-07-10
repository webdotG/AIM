import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { NodeType } from '../../../shared/types';
export declare class NodeTypesRepository extends BaseRepository {
    constructor(pool: Pool);
    findAll(): Promise<NodeType[]>;
    findById(id: number): Promise<NodeType | null>;
    findByCode(code: string): Promise<NodeType | null>;
}
//# sourceMappingURL=NodeTypesRepository.d.ts.map