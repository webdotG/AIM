"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DreamsService = void 0;
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const DreamsRepository_1 = require("../repositories/DreamsRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class DreamsService {
    constructor(pool) {
        this.pool = pool;
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.dreamsRepo = new DreamsRepository_1.DreamsRepository(pool);
    }
    async createDream(userId, data) {
        if (!data.content || data.content.trim().length === 0) {
            throw new AppError_1.ValidationError('Content is required');
        }
        if ((data.lucidity ?? 0) < 1 || (data.lucidity ?? 0) > 10) {
            throw new AppError_1.ValidationError('Lucidity must be between 1 and 10');
        }
        if ((data.vividness ?? 0) < 1 || (data.vividness ?? 0) > 10) {
            throw new AppError_1.ValidationError('Vividness must be between 1 and 10');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const node = await this.nodesRepo.create(userId, 'dream', data.title || null);
            if (!node) {
                throw new AppError_1.ValidationError('Failed to create dream node');
            }
            const dream = await this.dreamsRepo.create(node.id, data);
            await client.query('COMMIT');
            return { node, dream };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getDreams(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT n.*, d.*
      FROM nodes n
      JOIN dreams d ON d.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND d.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.from_date) {
            query += ` AND d.dream_date >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND d.dream_date <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        if (filters.nightmare !== undefined) {
            query += ` AND d.nightmare = $${paramIndex}`;
            params.push(filters.nightmare);
            paramIndex++;
        }
        query += ` ORDER BY d.dream_date DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const client = await this.pool.connect();
        const result = await client.query(query, params);
        client.release();
        const totalResult = await this.nodesRepo.countByUserId(userId, {});
        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total: totalResult,
                totalPages: Math.ceil(totalResult / limit),
            },
        };
    }
    async getDreamById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node) {
            throw new AppError_1.NotFoundError('Dream not found');
        }
        const dream = await this.dreamsRepo.findByNodeId(nodeId);
        if (!dream) {
            throw new AppError_1.NotFoundError('Dream data not found');
        }
        return { node, dream };
    }
    async updateDream(nodeId, userId, updates) {
        await this.getDreamById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            if (updates.title !== undefined) {
                await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            }
            const dreamUpdates = { ...updates };
            delete dreamUpdates.title;
            if (Object.keys(dreamUpdates).length > 0) {
                const dream = await this.dreamsRepo.update(nodeId, dreamUpdates);
                if (!dream) {
                    throw new AppError_1.NotFoundError('Dream not found');
                }
            }
            await client.query('COMMIT');
            return this.getDreamById(nodeId, userId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteDream(nodeId, userId) {
        await this.getDreamById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.dreamsRepo.softDelete(nodeId);
            await this.nodesRepo.softDelete(nodeId, userId);
            await client.query('COMMIT');
            return { success: true };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.DreamsService = DreamsService;
//# sourceMappingURL=DreamsService.js.map