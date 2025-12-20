"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntriesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EntriesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super('entries', pool);
    }
    async findByUserId(userId, filters = {}) {
        let query = `SELECT * FROM entries WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;
        // Добавляем фильтры
        if (filters.entry_type) {
            query += ` AND entry_type = $${paramIndex}`;
            params.push(filters.entry_type);
            paramIndex++;
        }
        if (filters.from_date) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        query += ` ORDER BY created_at DESC`;
        // Пагинация
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
        let query = `SELECT * FROM entries WHERE id = $1`;
        const params = [id];
        if (userId) {
            query += ` AND user_id = $2`;
            params.push(userId);
        }
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async create(entryData) {
        const result = await this.pool.query(`INSERT INTO entries (user_id, entry_type, content, event_date, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [
            entryData.user_id,
            entryData.entry_type,
            entryData.content,
            entryData.event_date || null,
            entryData.deadline || null
        ]);
        return result.rows[0];
    }
    async update(id, updates, userId) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
        // Добавляем updated_at
        fields.push(`updated_at = NOW()`);
        // Добавляем условия WHERE
        values.push(id, userId);
        const query = `
      UPDATE entries 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async deleteByUser(id, userId) {
        const result = await this.pool.query(`DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows[0];
    }
    async countByUserId(userId) {
        const result = await this.pool.query(`SELECT COUNT(*) FROM entries WHERE user_id = $1`, [userId]);
        return parseInt(result.rows[0].count);
    }
}
exports.EntriesRepository = EntriesRepository;
