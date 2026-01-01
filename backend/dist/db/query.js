"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
const pool_1 = require("./pool");
async function query(sql, params = []) {
    try {
        const result = await pool_1.pool.query(sql, params);
        return result.rows;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}
async function execute(sql, params = []) {
    await query(sql, params);
}
//# sourceMappingURL=query.js.map