"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsService = void 0;
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const ActionsRepository_1 = require("../repositories/ActionsRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class ActionsService {
    constructor(pool) {
        this.pool = pool;
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.actionsRepo = new ActionsRepository_1.ActionsRepository(pool);
    }
    async createAction(userId, data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const node = await this.nodesRepo.create(userId, 'action', data.title || null);
            if (!node)
                throw new AppError_1.ValidationError('Failed to create action node');
            const action = await this.actionsRepo.create(node.id, data);
            await client.query('COMMIT');
            return { node, action };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getActions(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT n.*, a.*
      FROM nodes n
      JOIN actions a ON a.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND a.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.search) {
            query += ` AND (a.description ILIKE $${paramIndex} OR n.title ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.from_date) {
            query += ` AND a.started_at >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND a.started_at <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        query += ` ORDER BY a.started_at DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const client = await this.pool.connect();
        const result = await client.query(query, params);
        client.release();
        return {
            data: result.rows,
            pagination: { page, limit, total: result.rows.length, totalPages: Math.ceil(result.rows.length / limit) },
        };
    }
    async getActionById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node)
            throw new AppError_1.NotFoundError('Action not found');
        const action = await this.actionsRepo.findByNodeId(nodeId);
        if (!action)
            throw new AppError_1.NotFoundError('Action data not found');
        return { node, action };
    }
    async updateAction(nodeId, userId, updates) {
        await this.getActionById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            if (updates.title !== undefined)
                await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            const actionUpdates = { ...updates };
            delete actionUpdates.title;
            if (Object.keys(actionUpdates).length > 0) {
                const action = await this.actionsRepo.update(nodeId, actionUpdates);
                if (!action)
                    throw new AppError_1.NotFoundError('Action not found');
            }
            await client.query('COMMIT');
            return this.getActionById(nodeId, userId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteAction(nodeId, userId) {
        await this.getActionById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.actionsRepo.softDelete(nodeId);
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
exports.ActionsService = ActionsService;
//# sourceMappingURL=ActionsService.js.map