"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationsService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class RelationsService {
    constructor(relationsRepository, entriesRepository) {
        this.relationsRepository = relationsRepository;
        this.entriesRepository = entriesRepository;
    }
    async getForEntry(entryId, userId) {
        // Проверяем права доступа
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        return await this.relationsRepository.getForEntry(entryId);
    }
    async createRelation(data, userId) {
        // Проверяем, что обе записи принадлежат пользователю
        const [fromEntry, toEntry] = await Promise.all([
            this.entriesRepository.findById(data.from_entry_id, userId),
            this.entriesRepository.findById(data.to_entry_id, userId)
        ]);
        if (!fromEntry) {
            throw new AppError_1.AppError('From entry not found', 404);
        }
        if (!toEntry) {
            throw new AppError_1.AppError('To entry not found', 404);
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
    async deleteRelation(relationId, userId) {
        const relation = await this.relationsRepository.findById(relationId);
        if (!relation) {
            throw new AppError_1.AppError('Relation not found', 404);
        }
        // Проверяем, что запись принадлежит пользователю
        const entry = await this.entriesRepository.findById(relation.from_entry_id, userId);
        if (!entry) {
            throw new AppError_1.AppError('Relation not found', 404);
        }
        await this.relationsRepository.delete(relationId);
        return { success: true, message: 'Relation deleted successfully' };
    }
    async getChain(entryId, userId, maxDepth = 10, direction = 'both') {
        // Проверяем права доступа
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
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
    async getMostConnected(userId, limit = 10) {
        return await this.relationsRepository.getMostConnected(userId, limit);
    }
    async getGraphData(userId, entryId) {
        if (entryId) {
            // Проверяем права доступа
            const entry = await this.entriesRepository.findById(entryId, userId);
            if (!entry) {
                throw new AppError_1.AppError('Entry not found', 404);
            }
        }
        return await this.relationsRepository.getGraphData(userId, entryId);
    }
}
exports.RelationsService = RelationsService;
//# sourceMappingURL=RelationsService.js.map