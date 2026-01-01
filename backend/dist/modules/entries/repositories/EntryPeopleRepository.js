"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryPeopleRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EntryPeopleRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async addPersonToEntry(entryId, personId, role, notes) {
        const result = await this.pool.query(`INSERT INTO entry_people (entry_id, person_id, role, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entry_id, person_id) DO UPDATE 
       SET role = EXCLUDED.role, notes = EXCLUDED.notes
       RETURNING *`, [entryId, personId, role, notes]);
        return result.rows[0];
    }
    async getPeopleByEntryId(entryId) {
        const result = await this.pool.query(`SELECT p.*, ep.role, ep.notes 
       FROM entry_people ep
       JOIN people p ON ep.person_id = p.id
       WHERE ep.entry_id = $1`, [entryId]);
        return result.rows;
    }
    async removePersonFromEntry(entryId, personId) {
        const result = await this.pool.query(`DELETE FROM entry_people 
       WHERE entry_id = $1 AND person_id = $2
       RETURNING id`, [entryId, personId]);
        return result.rows[0];
    }
}
exports.EntryPeopleRepository = EntryPeopleRepository;
//# sourceMappingURL=EntryPeopleRepository.js.map