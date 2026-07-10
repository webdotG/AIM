import { Request, Response, NextFunction } from 'express';
export declare class MeasurementsController {
    private service;
    constructor();
    createMeasurement: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMeasurements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMeasurements: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const measurementsController: MeasurementsController;
//# sourceMappingURL=MeasurementsController.d.ts.map