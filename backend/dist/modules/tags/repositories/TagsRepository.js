"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class TagsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}, limit = 50, offset = 0) {
        let query = 'SELECT * FROM tags WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;
        if (filters.search) {
            query += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async findById(tagId, userId) {
        const result = await this.pool.query('SELECT * FROM tags WHERE id = $1 AND user_id = $2', [tagId, userId]);
        return result.rows[0] || null;
    }
    async create(userId, name) {
        const result = await this.pool.query('INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
        return result.rows[0];
    }
    async update(tagId, userId, name) {
        const result = await this.pool.query('UPDATE tags SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [name, tagId, userId]);
        return result.rows[0] || null;
    }
    async delete(tagId, userId) {
        const result = await this.pool.query('DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id', [tagId, userId]);
        return result.rows[0] || null;
    }
    async findOrCreate(userId, name) {
        const result = await this.pool.query('SELECT * FROM tags WHERE user_id = $1 AND lower(name) = lower($2)', [userId, name]);
        if (result.rows.length > 0)
            return result.rows[0];
        return this.create(userId, name);
    }
    async getNodesByTag(tagId, userId) {
        const result = await this.pool.query(`SELECT n.*, nt.code AS node_type_code
       FROM node_tags ntg
       JOIN nodes n ON n.id = ntg.node_id
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE ntg.tag_id = $1 AND n.user_id = $2 AND n.deleted_at IS NULL
       ORDER BY n.created_at DESC`, [tagId, userId]);
        return result.rows;
    }
    async replaceTagsForNode(nodeId, tagIds, userId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM node_tags WHERE node_id = $1', [nodeId]);
            if (tagIds.length > 0) {
                for (const tagId of tagIds) {
                    await client.query('INSERT INTO node_tags (node_id, tag_id) VALUES ($1, $2)', [nodeId, tagId]);
                }
            }
            await client.query('COMMIT');
            return this.getTagsForNode(nodeId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getTagsForNode(nodeId) {
        const result = await this.pool.query(`SELECT t.* FROM node_tags ntg
       JOIN tags t ON t.id = ntg.tag_id
       WHERE ntg.node_id = $1`, [nodeId]);
        return result.rows;
    }
    async getMostUsed(userId, limit = 10) {
        const result = await this.pool.query(`SELECT t.*, COUNT(ntg.node_id) AS usage_count
       FROM tags t
       JOIN node_tags ntg ON ntg.tag_id = t.id
       JOIN nodes n ON n.id = ntg.node_id
       WHERE t.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY t.id, t.user_id, t.name
       ORDER BY usage_count DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    async getUnused(userId) {
        const result = await this.pool.query(`SELECT t.* FROM tags t
       WHERE t.user_id = $1
       AND NOT EXISTS (SELECT 1 FROM node_tags ntg WHERE ntg.tag_id = t.id)`, [userId]);
        return result.rows;
    }
}
exports.TagsRepository = TagsRepository;
//# sourceMappingURL=TagsRepository.js.map