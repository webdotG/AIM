import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface PersonData {
    user_id: number;
    name: string;
    category: string;
    relationship?: string | null;
    bio?: string | null;
    birth_date?: Date | null;
    notes?: string | null;
}
export declare class PeopleRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: number, userId?: number): Promise<any>;
    create(data: PersonData): Promise<any>;
    update(id: number, updates: any, userId: number): Promise<any>;
    deleteByUser(id: number, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
    getMostMentioned(userId: number, limit?: number): Promise<any[]>;
    getForEntry(entryId: string): Promise<any[]>;
}
export {};
//# sourceMappingURL=PeopleRepository.d.ts.map