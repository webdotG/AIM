import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface EmotionAttachment {
    entry_id: string;
    emotion_id: number;
    intensity: number;
}
export declare class EmotionsRepository extends BaseRepository {
    constructor(pool: Pool);
    findAll(): Promise<any[]>;
    findByCategory(category: 'positive' | 'negative' | 'neutral'): Promise<any[]>;
    findById(id: number): Promise<any>;
    getForEntry(entryId: string): Promise<any[]>;
    attachToEntry(entryId: string, emotions: EmotionAttachment[]): Promise<void>;
    detachFromEntry(entryId: string): Promise<void>;
    getUserEmotionStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getMostFrequent(userId: number, limit?: number): Promise<any[]>;
    getCategoryDistribution(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getEmotionTimeline(userId: number, fromDate: Date, toDate: Date, granularity?: 'day' | 'week' | 'month'): Promise<any[]>;
}
export {};
//# sourceMappingURL=EmotionsRepository.d.ts.map