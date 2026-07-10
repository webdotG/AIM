"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionsService = void 0;
const EmotionsRepository_1 = require("../repositories/EmotionsRepository");
const NodeEmotionsRepository_1 = require("../repositories/NodeEmotionsRepository");
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class EmotionsService {
    constructor(pool) {
        this.emotionsRepo = new EmotionsRepository_1.EmotionsRepository(pool);
        this.nodeEmotionsRepo = new NodeEmotionsRepository_1.NodeEmotionsRepository(pool);
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
    }
    async getAllEmotions() {
        return this.emotionsRepo.findAll();
    }
    async getByCategory(category) {
        if (!['positive', 'negative', 'neutral'].includes(category)) {
            throw new AppError_1.ValidationError('Invalid category. Must be positive, negative, or neutral.');
        }
        return this.emotionsRepo.findByCategory(category);
    }
    async getEmotionsForNode(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return this.nodeEmotionsRepo.findByNodeId(nodeId);
    }
    async replaceEmotionsForNode(nodeId, userId, emotions) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        for (const e of emotions) {
            if (e.intensity < 1 || e.intensity > 10) {
                throw new AppError_1.ValidationError('Intensity must be between 1 and 10');
            }
            const emotion = await this.emotionsRepo.findById(e.emotion_id);
            if (!emotion) {
                throw new AppError_1.ValidationError(`Emotion with id ${e.emotion_id} not found`);
            }
        }
        return this.nodeEmotionsRepo.replaceForNode(nodeId, emotions);
    }
    async removeEmotionsFromNode(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        const count = await this.nodeEmotionsRepo.removeFromNode(nodeId);
        return { removed: count };
    }
    async getStats(userId) {
        return this.nodeEmotionsRepo.getMostFrequent(userId, 27);
    }
    async getMostFrequent(userId, limit = 10) {
        return this.nodeEmotionsRepo.getMostFrequent(userId, limit);
    }
    async getDistribution(userId, granularity = 'day') {
        return this.nodeEmotionsRepo.getDistribution(userId, granularity);
    }
}
exports.EmotionsService = EmotionsService;
//# sourceMappingURL=EmotionsService.js.map