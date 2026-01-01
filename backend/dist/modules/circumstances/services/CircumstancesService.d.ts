import { CircumstancesRepository } from '../repositories/CircumstancesRepository';
export declare class CircumstancesService {
    private circumstancesRepository;
    constructor(circumstancesRepository: CircumstancesRepository);
    getAllCircumstances(userId: number, filters?: any): Promise<{
        circumstances: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getCircumstanceById(id: number, userId: number): Promise<any>;
    createCircumstance(data: any, userId: number): Promise<any>;
    updateCircumstance(id: number, updates: any, userId: number): Promise<any>;
    deleteCircumstance(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    findNearestByTimestamp(userId: number, timestamp: Date): Promise<any>;
    getWeatherStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    getMoonPhaseStats(userId: number, fromDate?: Date, toDate?: Date): Promise<any[]>;
    private validateCircumstanceData;
}
//# sourceMappingURL=CircumstancesService.d.ts.map