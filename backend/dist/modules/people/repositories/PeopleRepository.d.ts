import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class PeopleRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any>;
    findByUserId(userId: number, filters?: {
        search?: string;
        relationship?: string;
    }, page?: number, limit?: number): Promise<any[]>;
    getMostMentioned(userId: number, limit?: number): Promise<any[]>;
    getContacts(nodeId: string, userId: number): Promise<any[]>;
    create(nodeId: string, data: {
        full_name: string;
        nickname?: string | null;
        birth_date?: Date | null;
        relationship?: string | null;
        notes?: string | null;
    }): Promise<any>;
    update(nodeId: string, updates: Partial<{
        full_name: string;
        nickname: string | null;
        birth_date: Date | null;
        relationship: string | null;
        notes: string | null;
    }>): Promise<any>;
    softDelete(nodeId: string): Promise<any>;
}
//# sourceMappingURL=PeopleRepository.d.ts.map