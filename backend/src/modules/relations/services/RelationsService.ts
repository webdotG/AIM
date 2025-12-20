import { RelationsRepository } from '../repositories/RelationsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { AppError } from '../../../shared/errors/AppError';

export class RelationsService {
  constructor(
    private relationsRepository: RelationsRepository,
    private entriesRepository: EntriesRepository
  ) {}

  async getForEntry(entryId: string, userId: number) {
    // Проверяем права доступа
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    return await this.relationsRepository.getForEntry(entryId);
  }

  async createRelation(data: any, userId: number) {
    // Проверяем, что обе записи принадлежат пользователю
    const [fromEntry, toEntry] = await Promise.all([
      this.entriesRepository.findById(data.from_entry_id, userId),
      this.entriesRepository.findById(data.to_entry_id, userId)
    ]);

    if (!fromEntry) {
      throw new AppError('From entry not found', 404);
    }

    if (!toEntry) {
      throw new AppError('To entry not found', 404);
    }

    // Проверяем на цикл
    const hasCycle = await this.relationsRepository.hasCycle(data.from_entry_id, data.to_entry_id);
    
    if (hasCycle) {
      // Цикл обнаружен - это ОК для нашей системы, но предупредим
      console.warn(`Cycle detected: ${data.from_entry_id} -> ${data.to_entry_id}`);
    }

    const relation = await this.relationsRepository.create(data);

    return {
      ...relation,
      has_cycle: hasCycle
    };
  }

  async deleteRelation(relationId: number, userId: number) {
    const relation = await this.relationsRepository.findById(relationId);
    
    if (!relation) {
      throw new AppError('Relation not found', 404);
    }

    // Проверяем, что запись принадлежит пользователю
    const entry = await this.entriesRepository.findById(relation.from_entry_id, userId);
    
    if (!entry) {
      throw new AppError('Relation not found', 404);
    }

    await this.relationsRepository.delete(relationId);

    return { success: true, message: 'Relation deleted successfully' };
  }

  async getChain(entryId: string, userId: number, maxDepth: number = 10, direction: 'forward' | 'backward' | 'both' = 'both') {
    // Проверяем права доступа
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    const chain = await this.relationsRepository.getChain(entryId, maxDepth, direction);

    return {
      chain,
      total_depth: chain.length > 0 ? Math.max(...chain.map(e => e.depth)) : 0,
      entry_count: chain.length
    };
  }

  async getRelationTypes() {
    return await this.relationsRepository.getRelationTypes();
  }

  async getMostConnected(userId: number, limit: number = 10) {
    return await this.relationsRepository.getMostConnected(userId, limit);
  }

  async getGraphData(userId: number, entryId?: string) {
    if (entryId) {
      // Проверяем права доступа
      const entry = await this.entriesRepository.findById(entryId, userId);
      
      if (!entry) {
        throw new AppError('Entry not found', 404);
      }
    }

    return await this.relationsRepository.getGraphData(userId, entryId);
  }
}