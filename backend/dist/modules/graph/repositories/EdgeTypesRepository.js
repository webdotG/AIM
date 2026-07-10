"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeTypesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EdgeTypesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findAll() {
        const result = await this.pool.query(`SELECT id, code, name, description FROM edge_types ORDER BY id`);
        return result.rows;
    }
    async findById(id) {
        const result = await this.pool.query(`SELECT id, code, name, description FROM edge_types WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    async findByCode(code) {
        const result = await this.pool.query(`SELECT id, code, name, description FROM edge_types WHERE code = $1`, [code]);
        return result.rows[0] || null;
    }
}
exports.EdgeTypesRepository = EdgeTypesRepository;
//# sourceMappingURL=EdgeTypesRepository.js.map