"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansService = void 0;
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const PlansRepository_1 = require("../repositories/PlansRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class PlansService {
    constructor(pool) {
        this.pool = pool;
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.plansRepo = new PlansRepository_1.PlansRepository(pool);
    }
    async createPlan(userId, data) {
        if (!data.description || data.description.trim().length === 0) {
            throw new AppError_1.ValidationError('Description is required');
        }
        if (data.priority != null && (data.priority < 1 || data.priority > 10)) {
            throw new AppError_1.ValidationError('Priority must be between 1 and 10');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const node = await this.nodesRepo.create(userId, 'plan', data.title || null);
            if (!node)
                throw new AppError_1.ValidationError('Failed to create plan node');
            const plan = await this.plansRepo.create(node.id, data);
            await client.query('COMMIT');
            return { node, plan };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getPlans(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT n.*, p.*
      FROM nodes n
      JOIN plans p ON p.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND p.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.completed !== undefined) {
            query += ` AND p.completed = $${paramIndex}`;
            params.push(filters.completed);
            paramIndex++;
        }
        if (filters.overdue) {
            query += ` AND p.completed = false AND p.deadline IS NOT NULL AND p.deadline < NOW()`;
        }
        if (filters.from_date) {
            query += ` AND p.deadline >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND p.deadline <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        if (filters.search) {
            query += ` AND (p.description ILIKE $${paramIndex} OR n.title ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        query += ` ORDER BY
      CASE WHEN p.completed = false AND p.deadline IS NOT NULL AND p.deadline < NOW() THEN 0 ELSE 1 END,
      p.deadline ASC NULLS LAST`;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const client = await this.pool.connect();
        const result = await client.query(query, params);
        client.release();
        return {
            data: result.rows,
            pagination: { page, limit, total: result.rows.length, totalPages: Math.ceil(result.rows.length / limit) },
        };
    }
    async getPlanById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node)
            throw new AppError_1.NotFoundError('Plan not found');
        const plan = await this.plansRepo.findByNodeId(nodeId);
        if (!plan)
            throw new AppError_1.NotFoundError('Plan data not found');
        return { node, plan };
    }
    async updatePlan(nodeId, userId, updates) {
        await this.getPlanById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            if (updates.title !== undefined)
                await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            const planUpdates = { ...updates };
            delete planUpdates.title;
            if (updates.completed === true) {
                planUpdates.completed_at = new Date();
            }
            if (updates.completed === false) {
                planUpdates.completed_at = null;
            }
            if (Object.keys(planUpdates).length > 0) {
                const plan = await this.plansRepo.update(nodeId, planUpdates);
                if (!plan)
                    throw new AppError_1.NotFoundError('Plan not found');
            }
            await client.query('COMMIT');
            return this.getPlanById(nodeId, userId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deletePlan(nodeId, userId) {
        await this.getPlanById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.plansRepo.softDelete(nodeId);
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
exports.PlansService = PlansService;
//# sourceMappingURL=PlansService.js.map