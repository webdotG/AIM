"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class NodesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}, pagination = { limit: 50, offset: 0 }) {
        let query = `
      SELECT n.*, nt.code AS node_type_code, nt.name AS node_type_name
      FROM nodes n
      JOIN node_types nt ON nt.id = n.node_type_id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.node_type_code) {
            query += ` AND nt.code = $${paramIndex}`;
            params.push(filters.node_type_code);
            paramIndex++;
        }
        if (filters.search) {
            query += ` AND n.title ILIKE $${paramIndex}`;
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
        params.push(pagination.limit, pagination.offset);
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async countByUserId(userId, filters = {}) {
        let query = `
      SELECT COUNT(*) FROM nodes n
      JOIN node_types nt ON nt.id = n.node_type_id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL
    `;
        const params = [userId];
        if (filters.node_type_code) {
            query += ` AND nt.code = $2`;
            params.push(filters.node_type_code);
        }
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    async findById(id, userId) {
        const result = await this.pool.query(`SELECT n.*, nt.code AS node_type_code, nt.name AS node_type_name
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE n.id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL`, [id, userId]);
        return result.rows[0] || null;
    }
    async findByNodeId(nodeId, userId) {
        const result = await this.pool.query(`SELECT n.*, nt.code AS node_type_code, nt.name AS node_type_name
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE n.id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL`, [nodeId, userId]);
        return result.rows[0] || null;
    }
    async create(userId, nodeTypeCode, title = null) {
        const result = await this.pool.query(`WITH new_node AS (
        INSERT INTO nodes (user_id, node_type_id, title)
        SELECT $1, nt.id, $2
        FROM node_types nt WHERE nt.code = $3
        RETURNING *
      )
      SELECT n.*, nt.code AS node_type_code, nt.name AS node_type_name
      FROM new_node n
      JOIN node_types nt ON nt.id = n.node_type_id`, [userId, title, nodeTypeCode]);
        return result.rows[0];
    }
    async updateTitle(id, userId, title) {
        const result = await this.pool.query(`UPDATE nodes SET title = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING *`, [title, id, userId]);
        return result.rows[0] || null;
    }
    async softDelete(id, userId) {
        const result = await this.pool.query(`UPDATE nodes SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`, [id, userId]);
        return result.rows[0] || null;
    }
    async belongsToUser(nodeId, userId) {
        const result = await this.pool.query(`SELECT 1 FROM nodes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [nodeId, userId]);
        return result.rows.length > 0;
    }
}
exports.NodesRepository = NodesRepository;
//# sourceMappingURL=NodesRepository.js.map