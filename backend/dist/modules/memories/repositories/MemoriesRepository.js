"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoriesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class MemoriesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query(`SELECT * FROM memories WHERE node_id = $1 AND deleted_at IS NULL`, [nodeId]);
        return result.rows[0] || null;
    }
    async create(nodeId, data) {
        const result = await this.pool.query(`INSERT INTO memories (node_id, content, event_date, confidence)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [nodeId, data.content, data.event_date ?? null, data.confidence ?? null]);
        return result.rows[0];
    }
    async update(nodeId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['content', 'event_date', 'confidence'];
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
        const result = await this.pool.query(`UPDATE memories SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, values);
        return result.rows[0] || null;
    }
    async softDelete(nodeId) {
        const result = await this.pool.query(`UPDATE memories SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`, [nodeId]);
        return result.rows[0] || null;
    }
}
exports.MemoriesRepository = MemoriesRepository;
//# sourceMappingURL=MemoriesRepository.js.map