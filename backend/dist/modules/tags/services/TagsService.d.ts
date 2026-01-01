import { TagsRepository } from '../repositories/TagsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
export declare class TagsService {
    private tagsRepository;
    private entriesRepository;
    constructor(tagsRepository: TagsRepository, entriesRepository: EntriesRepository);
    getAllTags(userId: number, filters?: any): Promise<{
        tags: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getTagById(id: number, userId: number): Promise<any>;
    createTag(name: string, userId: number): Promise<any>;
    updateTag(id: number, name: string, userId: number): Promise<any>;
    deleteTag(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getTagsForEntry(entryId: string, userId: number): Promise<any[]>;
    attachTagsToEntry(entryId: string, tagIds: number[], userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    detachTagsFromEntry(entryId: string, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getEntriesByTag(tagId: number, userId: number, limit?: number): Promise<any[]>;
    getMostUsed(userId: number, limit?: number): Promise<any[]>;
    getUnused(userId: number): Promise<any[]>;
    findOrCreateTag(name: string, userId: number): Promise<any>;
    getSimilarTags(tagId: number, userId: number, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=TagsService.d.ts.map