"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class PeopleRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query('SELECT * FROM people WHERE node_id = $1 AND deleted_at IS NULL', [nodeId]);
        return result.rows[0] || null;
    }
    async findByUserId(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT p.*, n.title, n.created_at,
             COUNT(e.id) FILTER (WHERE e.id IS NOT NULL) AS mention_count
      FROM people p
      JOIN nodes n ON n.id = p.node_id
      LEFT JOIN edges e ON (e.from_node_id = p.node_id OR e.to_node_id = p.node_id) AND e.deleted_at IS NULL
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND p.deleted_at IS NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.search) {
            query += ` AND (p.full_name ILIKE $${paramIndex} OR p.nickname ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.relationship) {
            query += ` AND p.relationship = $${paramIndex}`;
            params.push(filters.relationship);
            paramIndex++;
        }
        query += ` GROUP BY p.node_id, n.title, n.created_at ORDER BY mention_count DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async getMostMentioned(userId, limit = 10) {
        const result = await this.pool.query(`SELECT p.*, n.title,
              COUNT(e.id) AS mention_count
       FROM people p
       JOIN nodes n ON n.id = p.node_id
       LEFT JOIN edges e ON (e.from_node_id = p.node_id OR e.to_node_id = p.node_id) AND e.deleted_at IS NULL
       WHERE n.user_id = $1 AND n.deleted_at IS NULL AND p.deleted_at IS NULL
       GROUP BY p.node_id, n.title
       HAVING COUNT(e.id) > 0
       ORDER BY mention_count DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    async getContacts(nodeId, userId) {
        const result = await this.pool.query(`SELECT p.*,
              COUNT(e.id) AS interaction_count,
              array_agg(DISTINCT et.code) AS relation_types,
              array_agg(DISTINCT n.title) AS connected_items
       FROM edges e
       JOIN nodes n ON (n.id = e.from_node_id OR n.id = e.to_node_id) AND n.id != $1
       JOIN people p ON p.node_id = n.id AND p.deleted_at IS NULL
       JOIN edge_types et ON et.id = e.edge_type_id
       WHERE (e.from_node_id = $1 OR e.to_node_id = $1)
         AND e.deleted_at IS NULL
         AND n.user_id = $2
       GROUP BY p.node_id`, [nodeId, userId]);
        return result.rows;
    }
    async create(nodeId, data) {
        const result = await this.pool.query(`INSERT INTO people (node_id, full_name, nickname, birth_date, relationship, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [nodeId, data.full_name, data.nickname || null, data.birth_date || null, data.relationship || null, data.notes || null]);
        return result.rows[0];
    }
    async update(nodeId, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['full_name', 'nickname', 'birth_date', 'relationship', 'notes'];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        if (fields.length === 0)
            throw new Error('No valid fields to update');
        values.push(nodeId);
        const result = await this.pool.query(`UPDATE people SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, values);
        return result.rows[0] || null;
    }
    async softDelete(nodeId) {
        const result = await this.pool.query('UPDATE people SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id', [nodeId]);
        return result.rows[0] || null;
    }
}
exports.PeopleRepository = PeopleRepository;
//# sourceMappingURL=PeopleRepository.js.map