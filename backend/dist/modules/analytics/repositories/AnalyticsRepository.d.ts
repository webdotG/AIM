import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class AnalyticsRepository extends BaseRepository {
    constructor(pool: Pool);
    getOverallStats(userId: number): Promise<any>;
    getEntriesByMonth(userId: number, months?: number): Promise<any[]>;
    getEmotionDistribution(userId: number): Promise<any[]>;
    getActivityHeatmap(userId: number, year: number): Promise<any[]>;
    getStreaks(userId: number): Promise<{
        current_streak: number;
        is_current: boolean;
    }>;
    getEmotionTimeline(userId: number, granularity?: 'day' | 'week' | 'month'): Promise<any[]>;
    getNodeConnections(userId: number): Promise<any[]>;
    getUserProfile(userId: number): Promise<{
        node_stats: any;
        emotion_distribution: any[];
        streaks: {
            current_streak: number;
            is_current: boolean;
        };
        total_nodes: number;
    }>;
}
//# sourceMappingURL=AnalyticsRepository.d.ts.map