import { Pool } from 'pg';
import { BaseRepository } from '../../..//shared/repositories/BaseRepository';
interface CircumstanceData {
    user_id: number;
    timestamp?: Date;
    weather?: string | null;
    temperature?: number | null;
    moon_phase?: string | null;
    global_event?: string | null;
    notes?: string | null;
}
export declare class CircumstancesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: number, userId?: number): Promise<any>;
    create(data: CircumstanceData): Promise<any>;
    update(id: number, updates: any, userId: number): Promise<any>;
    deleteByUser(id: number, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
    findNearestByTimestamp(userId: number, timestamp: Date): Promise<any>;
    getWeatherStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getMoonPhaseStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
}
export {};
//# sourceMappingURL=CircumstancesRepository.d.ts.map