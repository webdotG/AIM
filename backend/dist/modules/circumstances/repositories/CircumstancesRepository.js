"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircumstancesRepository = void 0;
const BaseRepository_1 = require("../../..//shared/repositories/BaseRepository");
class CircumstancesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}) {
        let query = `
      SELECT * FROM circumstances 
      WHERE user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        // Фильтр по timestamp (from)
        if (filters.from_date) {
            query += ` AND timestamp >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        // Фильтр по timestamp (to)
        if (filters.to_date) {
            query += ` AND timestamp <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        // Фильтр по погоде
        if (filters.weather) {
            query += ` AND weather = $${paramIndex}`;
            params.push(filters.weather);
            paramIndex++;
        }
        // Фильтр по фазе луны
        if (filters.moon_phase) {
            query += ` AND moon_phase = $${paramIndex}`;
            params.push(filters.moon_phase);
            paramIndex++;
        }
        // Фильтр: есть ли глобальное событие
        if (filters.has_global_event === true) {
            query += ` AND global_event IS NOT NULL`;
        }
        else if (filters.has_global_event === false) {
            query += ` AND global_event IS NULL`;
        }
        query += ` ORDER BY timestamp DESC`;
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
        let query = `SELECT * FROM circumstances WHERE id = $1`;
        const params = [id];
        if (userId) {
            query += ` AND user_id = $2`;
            params.push(userId);
        }
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO circumstances (
        user_id, 
        timestamp, 
        weather,
        temperature,
        moon_phase,
        global_event,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`, [
            data.user_id,
            data.timestamp || new Date(),
            data.weather || null,
            data.temperature || null,
            data.moon_phase || null,
            data.global_event || null,
            data.notes || null
        ]);
        return result.rows[0];
    }
    async update(id, updates, userId) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'timestamp',
            'weather',
            'temperature',
            'moon_phase',
            'global_event',
            'notes'
        ];
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
      UPDATE circumstances 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async deleteByUser(id, userId) {
        const result = await this.pool.query(`DELETE FROM circumstances WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows[0];
    }
    async countByUserId(userId, filters = {}) {
        let query = `SELECT COUNT(*) FROM circumstances WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;
        if (filters.from_date) {
            query += ` AND timestamp >= $${paramIndex}`;
            params.push(filters.from_date);
            paramIndex++;
        }
        if (filters.to_date) {
            query += ` AND timestamp <= $${paramIndex}`;
            params.push(filters.to_date);
            paramIndex++;
        }
        if (filters.weather) {
            query += ` AND weather = $${paramIndex}`;
            params.push(filters.weather);
            paramIndex++;
        }
        if (filters.moon_phase) {
            query += ` AND moon_phase = $${paramIndex}`;
            params.push(filters.moon_phase);
            paramIndex++;
        }
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    // Найти ближайшие обстоятельства к определённому времени
    async findNearestByTimestamp(userId, timestamp) {
        const result = await this.pool.query(`SELECT 
        *,
        ABS(EXTRACT(EPOCH FROM (timestamp - $2))) as time_diff
      FROM circumstances 
      WHERE user_id = $1
      ORDER BY time_diff ASC
      LIMIT 1`, [userId, timestamp]);
        return result.rows[0];
    }
    // Получить статистику по погоде
    async getWeatherStats(userId, fromDate, toDate) {
        let query = `
      SELECT 
        weather,
        COUNT(*) as count,
        AVG(temperature) as avg_temperature
      FROM circumstances 
      WHERE user_id = $1
        AND weather IS NOT NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (fromDate) {
            query += ` AND timestamp >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            query += ` AND timestamp <= $${paramIndex}`;
            params.push(toDate);
            paramIndex++;
        }
        query += ` GROUP BY weather ORDER BY count DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    // Получить статистику по фазам луны
    async getMoonPhaseStats(userId, fromDate, toDate) {
        let query = `
      SELECT 
        moon_phase,
        COUNT(*) as count
      FROM circumstances 
      WHERE user_id = $1
        AND moon_phase IS NOT NULL
    `;
        const params = [userId];
        let paramIndex = 2;
        if (fromDate) {
            query += ` AND timestamp >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            query += ` AND timestamp <= $${paramIndex}`;
            params.push(toDate);
            paramIndex++;
        }
        query += ` GROUP BY moon_phase ORDER BY count DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
}
exports.CircumstancesRepository = CircumstancesRepository;
