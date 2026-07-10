import { Pool } from 'pg';
export declare class MeasurementsService {
    private measurementsRepo;
    private nodesRepo;
    constructor(pool: Pool);
    createMeasurement(nodeId: string, userId: number, input: {
        measurement_id: number;
        value_integer?: number;
        value_decimal?: number;
        value_boolean?: boolean;
        value_text?: string;
        unit?: string;
    }): Promise<any>;
    getMeasurements(nodeId: string, userId: number): Promise<any[]>;
    deleteMeasurements(nodeId: string, userId: number): Promise<{
        removed: number;
    }>;
}
//# sourceMappingURL=MeasurementsService.d.ts.map