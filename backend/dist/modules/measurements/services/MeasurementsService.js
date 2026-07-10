"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementsService = void 0;
const MeasurementsRepository_1 = require("../repositories/MeasurementsRepository");
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class MeasurementsService {
    constructor(pool) {
        this.measurementsRepo = new MeasurementsRepository_1.MeasurementsRepository(pool);
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
    }
    async createMeasurement(nodeId, userId, input) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        const valueCount = [input.value_integer, input.value_decimal, input.value_boolean, input.value_text].filter(v => v !== undefined && v !== null).length;
        if (valueCount !== 1) {
            throw new AppError_1.ValidationError('Exactly one value field must be provided');
        }
        return this.measurementsRepo.create(nodeId, input);
    }
    async getMeasurements(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return this.measurementsRepo.findByNodeId(nodeId);
    }
    async deleteMeasurements(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        const count = await this.measurementsRepo.deleteByNodeId(nodeId);
        return { removed: count };
    }
}
exports.MeasurementsService = MeasurementsService;
//# sourceMappingURL=MeasurementsService.js.map