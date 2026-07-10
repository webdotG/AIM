"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtsService = void 0;
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const ThoughtsRepository_1 = require("../repositories/ThoughtsRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class ThoughtsService {
    constructor(pool) {
        this.pool = pool;
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.thoughtsRepo = new ThoughtsRepository_1.ThoughtsRepository(pool);
    }
    async createThought(userId, data) {
        if (!data.content || data.content.trim().length === 0) {
            throw new AppError_1.ValidationError('Content is required');
        }
        if (data.importance != null && (data.importance < 1 || data.importance > 10)) {
            throw new AppError_1.ValidationError('Importance must be between 1 and 10');
        }
        if (data.confidence != null && (data.confidence < 1 || data.confidence > 10)) {
            throw new AppError_1.ValidationError('Confidence must be between 1 and 10');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const node = await this.nodesRepo.create(userId, 'thought', data.title || null);
            if (!node) {
                throw new AppError_1.ValidationError('Failed to create thought node');
            }
            const thought = await this.thoughtsRepo.create(node.id, data);
            await client.query('COMMIT');
            return { node, thought };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getThoughts(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT n.*, t.*
      FROM nodes n
      JOIN thoughts t ON t.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND t.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.search) {
            query += ` AND (t.content ILIKE $${paramIndex} OR n.title ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.from_date) {
            query += ` AND n.created_at >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND n.created_at <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const client = await this.pool.connect();
        const result = await client.query(query, params);
        client.release();
        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total: result.rows.length,
                totalPages: Math.ceil((await this.nodesRepo.countByUserId(userId, {})) / limit),
            },
        };
    }
    async getThoughtById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node)
            throw new AppError_1.NotFoundError('Thought not found');
        const thought = await this.thoughtsRepo.findByNodeId(nodeId);
        if (!thought)
            throw new AppError_1.NotFoundError('Thought data not found');
        return { node, thought };
    }
    async updateThought(nodeId, userId, updates) {
        await this.getThoughtById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            if (updates.title !== undefined) {
                await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            }
            const thoughtUpdates = { ...updates };
            delete thoughtUpdates.title;
            if (Object.keys(thoughtUpdates).length > 0) {
                const thought = await this.thoughtsRepo.update(nodeId, thoughtUpdates);
                if (!thought)
                    throw new AppError_1.NotFoundError('Thought not found');
            }
            await client.query('COMMIT');
            return this.getThoughtById(nodeId, userId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteThought(nodeId, userId) {
        await this.getThoughtById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.thoughtsRepo.softDelete(nodeId);
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
exports.ThoughtsService = ThoughtsService;
//# sourceMappingURL=ThoughtsService.js.map