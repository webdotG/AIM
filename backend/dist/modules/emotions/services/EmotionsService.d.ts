import { Pool } from 'pg';
export declare class EmotionsService {
    private emotionsRepo;
    private nodeEmotionsRepo;
    private nodesRepo;
    constructor(pool: Pool);
    getAllEmotions(): Promise<import("../../../shared/types").Emotion[]>;
    getByCategory(category: string): Promise<import("../../../shared/types").Emotion[]>;
    getEmotionsForNode(nodeId: string, userId: number): Promise<any[]>;
    replaceEmotionsForNode(nodeId: string, userId: number, emotions: {
        emotion_id: number;
        intensity: number;
    }[]): Promise<any[]>;
    removeEmotionsFromNode(nodeId: string, userId: number): Promise<{
        removed: number;
    }>;
    getStats(userId: number): Promise<any[]>;
    getMostFrequent(userId: number, limit?: number): Promise<any[]>;
    getDistribution(userId: number, granularity?: 'day' | 'week' | 'month'): Promise<any[]>;
}
//# sourceMappingURL=EmotionsService.d.ts.map