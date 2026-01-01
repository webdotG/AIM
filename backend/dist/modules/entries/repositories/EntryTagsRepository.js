"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryTagsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EntryTagsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async addTagToEntry(entryId, tagId) {
        const result = await this.pool.query(`INSERT INTO entry_tags (entry_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT (entry_id, tag_id) DO NOTHING
       RETURNING *`, [entryId, tagId]);
        return result.rows[0];
    }
    async getTagsByEntryId(entryId) {
        const result = await this.pool.query(`SELECT t.* 
       FROM entry_tags et
       JOIN tags t ON et.tag_id = t.id
       WHERE et.entry_id = $1`, [entryId]);
        return result.rows;
    }
    async removeTagFromEntry(entryId, tagId) {
        const result = await this.pool.query(`DELETE FROM entry_tags 
       WHERE entry_id = $1 AND tag_id = $2
       RETURNING entry_id`, [entryId, tagId]);
        return result.rows[0];
    }
}
exports.EntryTagsRepository = EntryTagsRepository;
//# sourceMappingURL=EntryTagsRepository.js.map