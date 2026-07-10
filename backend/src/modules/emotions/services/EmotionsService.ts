import { EmotionsRepository } from '../repositories/EmotionsRepository';
import { NodeEmotionsRepository } from '../repositories/NodeEmotionsRepository';
import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class EmotionsService {
  private emotionsRepo: EmotionsRepository;
  private nodeEmotionsRepo: NodeEmotionsRepository;
  private nodesRepo: NodesRepository;

  constructor(pool: Pool) {
    this.emotionsRepo = new EmotionsRepository(pool);
    this.nodeEmotionsRepo = new NodeEmotionsRepository(pool);
    this.nodesRepo = new NodesRepository(pool);
  }

  async getAllEmotions() {
    return this.emotionsRepo.findAll();
  }

  async getByCategory(category: string) {
    if (!['positive', 'negative', 'neutral'].includes(category)) {
      throw new ValidationError('Invalid category. Must be positive, negative, or neutral.');
    }
    return this.emotionsRepo.findByCategory(category as any);
  }

  async getEmotionsForNode(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    return this.nodeEmotionsRepo.findByNodeId(nodeId);
  }

  async replaceEmotionsForNode(nodeId: string, userId: number, emotions: { emotion_id: number; intensity: number }[]) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }

    for (const e of emotions) {
      if (e.intensity < 1 || e.intensity > 10) {
        throw new ValidationError('Intensity must be between 1 and 10');
      }
      const emotion = await this.emotionsRepo.findById(e.emotion_id);
      if (!emotion) {
        throw new ValidationError(`Emotion with id ${e.emotion_id} not found`);
      }
    }

    return this.nodeEmotionsRepo.replaceForNode(nodeId, emotions);
  }

  async removeEmotionsFromNode(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    const count = await this.nodeEmotionsRepo.removeFromNode(nodeId);
    return { removed: count };
  }

  async getStats(userId: number) {
    return this.nodeEmotionsRepo.getMostFrequent(userId, 27);
  }

  async getMostFrequent(userId: number, limit: number = 10) {
    return this.nodeEmotionsRepo.getMostFrequent(userId, limit);
  }

  async getDistribution(userId: number, granularity: 'day' | 'week' | 'month' = 'day') {
    return this.nodeEmotionsRepo.getDistribution(userId, granularity);
  }
}