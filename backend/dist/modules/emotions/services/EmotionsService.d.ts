import { EmotionsRepository } from '../repositories/EmotionsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
export declare class EmotionsService {
    private emotionsRepository;
    private entriesRepository;
    constructor(emotionsRepository: EmotionsRepository, entriesRepository: EntriesRepository);
    getAllEmotions(): Promise<any[]>;
    getEmotionsByCategory(category: 'positive' | 'negative' | 'neutral'): Promise<any[]>;
    getEmotionsForEntry(entryId: string, userId: number): Promise<any[]>;
    attachEmotionsToEntry(entryId: string, emotions: any[], userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    detachEmotionsFromEntry(entryId: string, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserEmotionStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getMostFrequent(userId: number, limit?: number): Promise<any[]>;
    getCategoryDistribution(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getEmotionTimeline(userId: number, fromDate: Date, toDate: Date, granularity?: 'day' | 'week' | 'month'): Promise<any[]>;
}
//# sourceMappingURL=EmotionsService.d.ts.map