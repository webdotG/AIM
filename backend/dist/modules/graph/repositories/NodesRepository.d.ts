import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class NodesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: {
        node_type_code?: string;
        search?: string;
        from_date?: string;
        to_date?: string;
    }, pagination?: {
        limit: number;
        offset: number;
    }): Promise<any[]>;
    countByUserId(userId: number, filters?: {
        node_type_code?: string;
    }): Promise<number>;
    findById(id: string, userId: number): Promise<any>;
    findByNodeId(nodeId: string, userId: number): Promise<any>;
    create(userId: number, nodeTypeCode: string, title?: string | null): Promise<any>;
    updateTitle(id: string, userId: number, title: string | null): Promise<any>;
    softDelete(id: string, userId: number): Promise<any>;
    belongsToUser(nodeId: string, userId: number): Promise<boolean>;
}
//# sourceMappingURL=NodesRepository.d.ts.map