import { Pool } from 'pg';
export declare class TagsService {
    private tagsRepo;
    private nodesRepo;
    constructor(pool: Pool);
    getTags(userId: number, filters?: {
        search?: string;
    }, page?: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTagById(tagId: number, userId: number): Promise<any>;
    createTag(userId: number, name: string): Promise<any>;
    updateTag(tagId: number, userId: number, name: string): Promise<any>;
    deleteTag(tagId: number, userId: number): Promise<{
        success: boolean;
    }>;
    findOrCreate(userId: number, name: string): Promise<{
        data: any;
    }>;
    getNodesByTag(tagId: number, userId: number): Promise<any[]>;
    getTagsForNode(nodeId: string, userId: number): Promise<any[]>;
    replaceTagsForNode(nodeId: string, userId: number, tagIds: number[]): Promise<any[]>;
    getMostUsed(userId: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnused(userId: number): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=TagsService.d.ts.map