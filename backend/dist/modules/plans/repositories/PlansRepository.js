"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class PlansRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query(`SELECT * FROM plans WHERE node_id = $1 AND deleted_at IS NULL`, [nodeId]);
        return result.rows[0] || null;
    }
    async create(nodeId, data) {
        const result = await this.pool.query(`INSERT INTO plans (node_id, description, deadline, priority, completed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            nodeId,
            data.description,
            data.deadline || null,
            data.priority ?? null,
            data.completed || false,
            data.completed_at || null,
        ]);
        return result.rows[0];
    }
    async update(nodeId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['description', 'deadline', 'priority', 'completed', 'completed_at'];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(nodeId);
        const result = await this.pool.query(`UPDATE plans SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, values);
        return result.rows[0] || null;
    }
    async softDelete(nodeId) {
        const result = await this.pool.query(`UPDATE plans SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`, [nodeId]);
        return result.rows[0] || null;
    }
}
exports.PlansRepository = PlansRepository;
//# sourceMappingURL=PlansRepository.js.map