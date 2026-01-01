import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface BodyStateData {
    user_id: number;
    timestamp?: Date;
    location_point?: {
        latitude: number;
        longitude: number;
    } | null;
    location_name?: string | null;
    location_address?: string | null;
    location_precision?: string | null;
    health_points?: number | null;
    energy_points?: number | null;
    circumstance_id?: number | null;
}
export declare class BodyStatesRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: number, userId?: number): Promise<any>;
    create(data: BodyStateData): Promise<any>;
    update(id: number, updates: any, userId: number): Promise<any>;
    deleteByUser(id: number, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
    findNearestByTimestamp(userId: number, timestamp: Date): Promise<any>;
}
export {};
//# sourceMappingURL=BodyStatesRepository.d.ts.map