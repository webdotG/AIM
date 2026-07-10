import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class NodeEmotionsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByNodeId(nodeId: string): Promise<any[]>;
    replaceForNode(nodeId: string, emotions: {
        emotion_id: number;
        intensity: number;
    }[]): Promise<any[]>;
    removeFromNode(nodeId: string): Promise<number>;
    getDistribution(userId: number, granularity?: 'day' | 'week' | 'month'): Promise<any[]>;
    getMostFrequent(userId: number, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=NodeEmotionsRepository.d.ts.map