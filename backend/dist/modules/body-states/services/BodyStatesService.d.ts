import { BodyStatesRepository } from '../repositories/BodyStatesRepository';
export declare class BodyStatesService {
    private bodyStatesRepository;
    constructor(bodyStatesRepository: BodyStatesRepository);
    getAllBodyStates(userId: number, filters?: any): Promise<{
        body_states: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getBodyStateById(id: number, userId: number): Promise<any>;
    createBodyState(data: any, userId: number): Promise<any>;
    updateBodyState(id: number, updates: any, userId: number): Promise<any>;
    deleteBodyState(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    findNearestByTimestamp(userId: number, timestamp: Date): Promise<any>;
    private validateBodyStateData;
}
//# sourceMappingURL=BodyStatesService.d.ts.map