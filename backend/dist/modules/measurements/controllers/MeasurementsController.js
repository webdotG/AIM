"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measurementsController = exports.MeasurementsController = void 0;
const MeasurementsService_1 = require("../services/MeasurementsService");
const pool_1 = require("../../../db/pool");
class MeasurementsController {
    constructor() {
        this.createMeasurement = async (req, res, next) => {
            try {
                const result = await this.service.createMeasurement(req.params.nodeId, req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMeasurements = async (req, res, next) => {
            try {
                const result = await this.service.getMeasurements(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteMeasurements = async (req, res, next) => {
            try {
                const result = await this.service.deleteMeasurements(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new MeasurementsService_1.MeasurementsService(pool_1.pool);
    }
}
exports.MeasurementsController = MeasurementsController;
exports.measurementsController = new MeasurementsController();
//# sourceMappingURL=MeasurementsController.js.map