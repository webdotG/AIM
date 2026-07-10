import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class TagsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: {
        search?: string;
    }, limit?: number, offset?: number): Promise<any[]>;
    findById(tagId: number, userId: number): Promise<any>;
    create(userId: number, name: string): Promise<any>;
    update(tagId: number, userId: number, name: string): Promise<any>;
    delete(tagId: number, userId: number): Promise<any>;
    findOrCreate(userId: number, name: string): Promise<any>;
    getNodesByTag(tagId: number, userId: number): Promise<any[]>;
    replaceTagsForNode(nodeId: string, tagIds: number[], userId: number): Promise<any[]>;
    getTagsForNode(nodeId: string): Promise<any[]>;
    getMostUsed(userId: number, limit?: number): Promise<any[]>;
    getUnused(userId: number): Promise<any[]>;
}
//# sourceMappingURL=TagsRepository.d.ts.map