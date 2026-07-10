"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const AIAnalysisService_1 = require("../services/AIAnalysisService");
const pool_1 = require("../../../db/pool");
class AIController {
    constructor() {
        this.requestAnalysis = async (req, res, next) => {
            try {
                const result = await this.service.requestAnalysis(req.params.nodeId, req.userId, req.body.analysis_type, process.env.AI_SERVICE_URL || 'http://localhost:8000');
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAnalysis = async (req, res, next) => {
            try {
                const result = await this.service.getAnalysis(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.requestImage = async (req, res, next) => {
            try {
                const result = await this.service.requestImageGeneration(req.params.nodeId, req.userId, req.body.prompt, process.env.AI_SERVICE_URL || 'http://localhost:8000');
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getImages = async (req, res, next) => {
            try {
                const result = await this.service.getImages(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new AIAnalysisService_1.AIAnalysisService(pool_1.pool);
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
//# sourceMappingURL=AIController.js.map