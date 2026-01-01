import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface EntryData {
    user_id: number;
    entry_type: string;
    content: string;
    body_state_id?: number | null;
    circumstance_id?: number | null;
    deadline?: Date | null;
    is_completed?: boolean;
}
export declare class EntriesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: string, userId?: number): Promise<any>;
    create(entryData: EntryData): Promise<any>;
    update(id: string, updates: any, userId: number): Promise<any>;
    deleteByUser(id: string, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
}
export {};
//# sourceMappingURL=EntriesRepository.d.ts.map