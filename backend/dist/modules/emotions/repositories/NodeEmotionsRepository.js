"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeEmotionsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class NodeEmotionsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNodeId(nodeId) {
        const result = await this.pool.query(`SELECT ne.*, e.code AS emotion_code, e.name_ru AS emotion_name_ru, e.name_en AS emotion_name_en, e.category AS emotion_category
       FROM node_emotions ne
       JOIN emotions e ON e.id = ne.emotion_id
       WHERE ne.node_id = $1
       ORDER BY ne.intensity DESC`, [nodeId]);
        return result.rows;
    }
    async replaceForNode(nodeId, emotions) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM node_emotions WHERE node_id = $1', [nodeId]);
            if (emotions.length > 0) {
                for (const e of emotions) {
                    await client.query('INSERT INTO node_emotions (node_id, emotion_id, intensity) VALUES ($1, $2, $3)', [nodeId, e.emotion_id, e.intensity]);
                }
            }
            await client.query('COMMIT');
            return this.findByNodeId(nodeId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async removeFromNode(nodeId) {
        const result = await this.pool.query('DELETE FROM node_emotions WHERE node_id = $1 RETURNING id', [nodeId]);
        return result.rowCount || 0;
    }
    async getDistribution(userId, granularity = 'day') {
        let timePart = '';
        if (granularity === 'day') {
            timePart = 'n.created_at::date';
        }
        else if (granularity === 'week') {
            timePart = 'date_trunc(\'week\', n.created_at)::date';
        }
        else {
            timePart = 'date_trunc(\'month\', n.created_at)::date';
        }
        const result = await this.pool.query(`SELECT
        ${timePart} AS period,
        e.category AS emotion_category,
        COUNT(*) AS occurrence_count,
        AVG(ne.intensity)::int AS avg_intensity
       FROM node_emotions ne
       JOIN nodes n ON n.id = ne.node_id
       JOIN emotions e ON e.id = ne.emotion_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY period, e.category
       ORDER BY period DESC, occurrence_count DESC`, [userId]);
        return result.rows;
    }
    async getMostFrequent(userId, limit = 10) {
        const result = await this.pool.query(`SELECT
        e.id AS emotion_id,
        e.code AS emotion_code,
        e.name_ru AS emotion_name_ru,
        e.name_en AS emotion_name_en,
        e.category AS emotion_category,
        COUNT(*) AS occurrence_count,
        AVG(ne.intensity)::int AS avg_intensity
       FROM node_emotions ne
       JOIN nodes n ON n.id = ne.node_id
       JOIN emotions e ON e.id = ne.emotion_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY e.id, e.code, e.name_ru, e.name_en, e.category
       ORDER BY occurrence_count DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
}
exports.NodeEmotionsRepository = NodeEmotionsRepository;
//# sourceMappingURL=NodeEmotionsRepository.js.map