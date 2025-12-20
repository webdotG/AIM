"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(tableName, pool) {
        this.tableName = tableName;
        this.pool = pool;
    }
    async findById(id) {
        const result = await this.pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
        return result.rows[0];
    }
    async findAll(conditions = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];
        let paramIndex = 1;
        if (Object.keys(conditions).length > 0) {
            const whereClauses = [];
            for (const [key, value] of Object.entries(conditions)) {
                whereClauses.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async delete(id) {
        await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    }
    async count(conditions = {}) {
        let query = `SELECT COUNT(*) FROM ${this.tableName}`;
        const params = [];
        let paramIndex = 1;
        if (Object.keys(conditions).length > 0) {
            const whereClauses = [];
            for (const [key, value] of Object.entries(conditions)) {
                whereClauses.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
}
exports.BaseRepository = BaseRepository;
