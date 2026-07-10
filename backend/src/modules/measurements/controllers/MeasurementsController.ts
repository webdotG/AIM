import { Request, Response, NextFunction } from 'express';
import { MeasurementsService } from '../services/MeasurementsService';
import { pool } from '../../../db/pool';

export class MeasurementsController {
  private service: MeasurementsService;
  constructor() { this.service = new MeasurementsService(pool); }

  createMeasurement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createMeasurement(req.params.nodeId, req.userId!, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getMeasurements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getMeasurements(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  deleteMeasurements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteMeasurements(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const measurementsController = new MeasurementsController();