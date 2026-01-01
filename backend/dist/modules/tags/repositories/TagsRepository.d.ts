import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface TagData {
    user_id: number;
    name: string;
}
export declare class TagsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: number, userId?: number): Promise<any>;
    findByName(userId: number, name: string): Promise<any>;
    create(data: TagData): Promise<any>;
    update(id: number, name: string, userId: number): Promise<any>;
    deleteByUser(id: number, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
    getForEntry(entryId: string): Promise<any[]>;
    attachToEntry(entryId: string, tagIds: number[]): Promise<void>;
    detachFromEntry(entryId: string): Promise<void>;
    getEntriesByTag(tagId: number, userId: number, limit?: number): Promise<any[]>;
    getMostUsed(userId: number, limit?: number): Promise<any[]>;
    getUnused(userId: number): Promise<any[]>;
    findOrCreate(userId: number, name: string): Promise<any>;
    getSimilar(userId: number, tagId: number, limit?: number): Promise<any[]>;
}
export {};
//# sourceMappingURL=TagsRepository.d.ts.map