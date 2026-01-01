import { RelationsRepository } from '../repositories/RelationsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
export declare class RelationsService {
    private relationsRepository;
    private entriesRepository;
    constructor(relationsRepository: RelationsRepository, entriesRepository: EntriesRepository);
    getForEntry(entryId: string, userId: number): Promise<{
        incoming: any[];
        outgoing: any[];
    }>;
    createRelation(data: any, userId: number): Promise<any>;
    deleteRelation(relationId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getChain(entryId: string, userId: number, maxDepth?: number, direction?: 'forward' | 'backward' | 'both'): Promise<{
        chain: any[];
        total_depth: number;
        entry_count: number;
    }>;
    getRelationTypes(): Promise<{
        name: string;
        description: string;
        direction: string;
    }[]>;
    getMostConnected(userId: number, limit?: number): Promise<any[]>;
    getGraphData(userId: number, entryId?: string): Promise<{
        nodes: any[];
        edges: {
            id: any;
            from: any;
            to: any;
            relation_type: any;
            description: any;
        }[];
    }>;
}
//# sourceMappingURL=RelationsService.d.ts.map