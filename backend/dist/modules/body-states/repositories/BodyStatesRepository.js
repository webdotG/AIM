"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyStatesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class BodyStatesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}) {
        let query = `
      SELECT 
        id,
        user_id,
        timestamp,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        location_name,
        location_address,
        location_precision,
        health_points,
        energy_points,
        circumstance_id,
        created_at
      FROM body_states 
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
        // Фильтр: есть ли локация
        if (filters.has_location === true) {
            query += ` AND location_point IS NOT NULL`;
        }
        else if (filters.has_location === false) {
            query += ` AND location_point IS NULL`;
        }
        // Фильтр по circumstance_id
        if (filters.circumstance_id !== undefined) {
            if (filters.circumstance_id === null) {
                query += ` AND circumstance_id IS NULL`;
            }
            else {
                query += ` AND circumstance_id = $${paramIndex}`;
                params.push(filters.circumstance_id);
                paramIndex++;
            }
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
        let query = `
      SELECT 
        id,
        user_id,
        timestamp,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        location_name,
        location_address,
        location_precision,
        health_points,
        energy_points,
        circumstance_id,
        created_at
      FROM body_states 
      WHERE id = $1
    `;
        const params = [id];
        if (userId) {
            query += ` AND user_id = $2`;
            params.push(userId);
        }
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async create(data) {
        // Если есть location_point, создаём GEOGRAPHY через ST_Point
        let locationValue = null;
        if (data.location_point) {
            locationValue = `ST_Point(${data.location_point.longitude}, ${data.location_point.latitude})`;
        }
        const query = locationValue
            ? `INSERT INTO body_states (
          user_id, 
          timestamp, 
          location_point,
          location_name,
          location_address,
          location_precision,
          health_points,
          energy_points,
          circumstance_id
        )
        VALUES ($1, $2, ${locationValue}::geography, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id,
          user_id,
          timestamp,
          ST_Y(location_point::geometry) as latitude,
          ST_X(location_point::geometry) as longitude,
          location_name,
          location_address,
          location_precision,
          health_points,
          energy_points,
          circumstance_id,
          created_at`
            : `INSERT INTO body_states (
          user_id, 
          timestamp, 
          location_point,
          location_name,
          location_address,
          location_precision,
          health_points,
          energy_points,
          circumstance_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
          id,
          user_id,
          timestamp,
          ST_Y(location_point::geometry) as latitude,
          ST_X(location_point::geometry) as longitude,
          location_name,
          location_address,
          location_precision,
          health_points,
          energy_points,
          circumstance_id,
          created_at`;
        const params = locationValue
            ? [
                data.user_id,
                data.timestamp || new Date(),
                data.location_name || null,
                data.location_address || null,
                data.location_precision || null,
                data.health_points || null,
                data.energy_points || null,
                data.circumstance_id || null
            ]
            : [
                data.user_id,
                data.timestamp || new Date(),
                null, // location_point
                data.location_name || null,
                data.location_address || null,
                data.location_precision || null,
                data.health_points || null,
                data.energy_points || null,
                data.circumstance_id || null
            ];
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async update(id, updates, userId) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'timestamp',
            'location_name',
            'location_address',
            'location_precision',
            'health_points',
            'energy_points',
            'circumstance_id'
        ];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        // Обработка location_point отдельно
        if (updates.location_point) {
            fields.push(`location_point = ST_Point($${paramIndex}, $${paramIndex + 1})::geography`);
            values.push(updates.location_point.longitude, updates.location_point.latitude);
            paramIndex += 2;
        }
        else if (updates.location_point === null) {
            fields.push(`location_point = NULL`);
        }
        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(id, userId);
        const query = `
      UPDATE body_states 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING 
        id,
        user_id,
        timestamp,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        location_name,
        location_address,
        location_precision,
        health_points,
        energy_points,
        circumstance_id,
        created_at
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async deleteByUser(id, userId) {
        const result = await this.pool.query(`DELETE FROM body_states WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows[0];
    }
    async countByUserId(userId, filters = {}) {
        let query = `SELECT COUNT(*) FROM body_states WHERE user_id = $1`;
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
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    // Найти ближайшее состояние тела к определённому времени
    async findNearestByTimestamp(userId, timestamp) {
        const result = await this.pool.query(`SELECT 
        id,
        user_id,
        timestamp,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        location_name,
        location_address,
        location_precision,
        health_points,
        energy_points,
        circumstance_id,
        created_at,
        ABS(EXTRACT(EPOCH FROM (timestamp - $2))) as time_diff
      FROM body_states 
      WHERE user_id = $1
      ORDER BY time_diff ASC
      LIMIT 1`, [userId, timestamp]);
        return result.rows[0];
    }
}
exports.BodyStatesRepository = BodyStatesRepository;
//# sourceMappingURL=BodyStatesRepository.js.map