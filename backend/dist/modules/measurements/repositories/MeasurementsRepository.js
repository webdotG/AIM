"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class MeasurementsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async create(nodeId, input) {
        const result = await this.pool.query(`INSERT INTO node_measurements (node_id, measurement_id, value_integer, value_decimal, value_boolean, value_text, unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            nodeId,
            input.measurement_id,
            input.value_integer ?? null,
            input.value_decimal ?? null,
            input.value_boolean ?? null,
            input.value_text ?? null,
            input.unit ?? null,
        ]);
        return result.rows[0];
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query(`SELECT nm.*, md.code AS measurement_code, md.name AS measurement_name, md.data_type
       FROM node_measurements nm
       JOIN measurement_definitions md ON md.id = nm.measurement_id
       WHERE nm.node_id = $1
       ORDER BY nm.measured_at DESC`, [nodeId]);
        return result.rows;
    }
    async deleteByNodeId(nodeId) {
        const result = await this.pool.query('DELETE FROM node_measurements WHERE node_id = $1', [nodeId]);
        return result.rowCount || 0;
    }
}
exports.MeasurementsRepository = MeasurementsRepository;
//# sourceMappingURL=MeasurementsRepository.js.map