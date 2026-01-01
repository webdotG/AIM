import { Pool } from 'pg';
export declare class AnalyticsService {
    private pool;
    constructor(pool: Pool);
    getOverallStats(userId: number): Promise<any>;
    getEntriesByMonth(userId: number, months?: number): Promise<any[]>;
    getEmotionDistribution(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getActivityHeatmap(userId: number, year: number): Promise<any[]>;
    getStreaks(userId: number): Promise<{
        current_streak: number;
    }>;
}
//# sourceMappingURL=AnalyticsService.d.ts.map