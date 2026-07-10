import { Request, Response, NextFunction } from 'express';
import { AIAnalysisService } from '../services/AIAnalysisService';
import { pool } from '../../../db/pool';

export class AIController {
  private service: AIAnalysisService;
  constructor() { this.service = new AIAnalysisService(pool); }

  requestAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.requestAnalysis(
        req.params.nodeId,
        req.userId!,
        req.body.analysis_type,
        process.env.AI_SERVICE_URL || 'http://localhost:8000'
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAnalysis(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  requestImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.requestImageGeneration(
        req.params.nodeId,
        req.userId!,
        req.body.prompt,
        process.env.AI_SERVICE_URL || 'http://localhost:8000'
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getImages(req.params.nodeId, req.userId!);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

export const aiController = new AIController();