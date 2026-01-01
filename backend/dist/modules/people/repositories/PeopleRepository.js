"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class PeopleRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}) {
        let query = `
      SELECT 
        p.*,
        COUNT(ep.entry_id) as mention_count
      FROM people p
      LEFT JOIN entry_people ep ON p.id = ep.person_id
      WHERE p.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.category) {
            query += ` AND p.category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }
        if (filters.search) {
            query += ` AND p.name ILIKE $${paramIndex}`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        query += ` GROUP BY p.id`;
        const sortMap = {
            name: 'p.name ASC',
            mentions: 'mention_count DESC',
            created_at: 'p.created_at DESC'
        };
        query += ` ORDER BY ${sortMap[filters.sort] || 'p.name ASC'}`;
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(filters.limit);
            paramIndex++;
            if (filters.offset) {
                query += ` OFFSET $${paramIndex}`;
                params.push(filters.offset);
            }
        }
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async findById(id, userId) {
        let query = `
      SELECT 
        p.*,
        COUNT(ep.entry_id) as mention_count
      FROM people p
      LEFT JOIN entry_people ep ON p.id = ep.person_id
      WHERE p.id = $1
    `;
        const params = [id];
        if (userId) {
            query += ` AND p.user_id = $2`;
            params.push(userId);
        }
        query += ` GROUP BY p.id`;
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO people (user_id, name, category, relationship, bio, birth_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [data.user_id, data.name, data.category, data.relationship || null, data.bio || null, data.birth_date || null, data.notes || null]);
        return result.rows[0];
    }
    async update(id, updates, userId) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['name', 'category', 'relationship', 'bio', 'birth_date', 'notes'];
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
        values.push(id, userId);
        const query = `
      UPDATE people 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async deleteByUser(id, userId) {
        const result = await this.pool.query(`DELETE FROM people WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows[0];
    }
    async countByUserId(userId, filters = {}) {
        let query = `SELECT COUNT(*) FROM people WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;
        if (filters.category) {
            query += ` AND category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    async getMostMentioned(userId, limit = 10) {
        const result = await this.pool.query(`SELECT p.*, COUNT(ep.entry_id) as mention_count
       FROM people p
       JOIN entry_people ep ON p.id = ep.person_id
       JOIN entries e ON ep.entry_id = e.id
       WHERE e.user_id = $1
       GROUP BY p.id
       ORDER BY mention_count DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    async getForEntry(entryId) {
        const result = await this.pool.query(`SELECT p.*, ep.role, ep.notes
       FROM people p
       JOIN entry_people ep ON p.id = ep.person_id
       WHERE ep.entry_id = $1`, [entryId]);
        return result.rows;
    }
}
exports.PeopleRepository = PeopleRepository;
//# sourceMappingURL=PeopleRepository.js.map