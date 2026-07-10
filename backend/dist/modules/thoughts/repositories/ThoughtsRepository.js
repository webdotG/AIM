"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class ThoughtsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query(`SELECT * FROM thoughts WHERE node_id = $1 AND deleted_at IS NULL`, [nodeId]);
        return result.rows[0] || null;
    }
    async create(nodeId, data) {
        const result = await this.pool.query(`INSERT INTO thoughts (node_id, content, importance, confidence)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [nodeId, data.content, data.importance ?? null, data.confidence ?? null]);
        return result.rows[0];
    }
    async update(nodeId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['content', 'importance', 'confidence'];
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
        const result = await this.pool.query(`UPDATE thoughts SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, values);
        return result.rows[0] || null;
    }
    async softDelete(nodeId) {
        const result = await this.pool.query(`UPDATE thoughts SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`, [nodeId]);
        return result.rows[0] || null;
    }
}
exports.ThoughtsRepository = ThoughtsRepository;
//# sourceMappingURL=ThoughtsRepository.js.map