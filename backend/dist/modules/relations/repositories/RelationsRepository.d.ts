import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface RelationData {
    from_entry_id: string;
    to_entry_id: string;
    relation_type: string;
    description?: string | null;
}
export declare class RelationsRepository extends BaseRepository {
    constructor(pool: Pool);
    findById(id: number): Promise<any>;
    getForEntry(entryId: string): Promise<{
        incoming: any[];
        outgoing: any[];
    }>;
    create(data: RelationData): Promise<any>;
    delete(id: number): Promise<any>;
    getChain(entryId: string, maxDepth?: number, direction?: 'forward' | 'backward' | 'both'): Promise<any[]>;
    hasCycle(fromId: string, toId: string): Promise<boolean>;
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
export {};
//# sourceMappingURL=RelationsRepository.d.ts.map