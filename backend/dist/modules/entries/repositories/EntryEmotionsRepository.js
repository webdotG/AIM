"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryEmotionsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EntryEmotionsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async addEmotionToEntry(entryId, emotionId, intensity) {
        const result = await this.pool.query(`INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
       VALUES ($1, $2, $3)
       RETURNING *`, [entryId, emotionId, intensity]);
        return result.rows[0];
    }
    async getEmotionsByEntryId(entryId) {
        const result = await this.pool.query(`SELECT e.*, ee.intensity 
       FROM entry_emotions ee
       JOIN emotions e ON ee.emotion_id = e.id
       WHERE ee.entry_id = $1`, [entryId]);
        return result.rows;
    }
    async removeEmotionFromEntry(entryId, emotionId) {
        const result = await this.pool.query(`DELETE FROM entry_emotions 
       WHERE entry_id = $1 AND emotion_id = $2
       RETURNING id`, [entryId, emotionId]);
        return result.rows[0];
    }
}
exports.EntryEmotionsRepository = EntryEmotionsRepository;
//# sourceMappingURL=EntryEmotionsRepository.js.map