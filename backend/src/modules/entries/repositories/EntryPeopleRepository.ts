// src/modules/entries/repositories/EntryPeopleRepository.ts
import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class EntryPeopleRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async addPersonToEntry(entryId: string, personId: number, role?: string, notes?: string) {
    const result = await this.pool.query(
      `INSERT INTO entry_people (entry_id, person_id, role, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entry_id, person_id) DO UPDATE 
       SET role = EXCLUDED.role, notes = EXCLUDED.notes
       RETURNING *`,
      [entryId, personId, role, notes]
    );
    return result.rows[0];
  }

  async getPeopleByEntryId(entryId: string) {
    const result = await this.pool.query(
      `SELECT p.*, ep.role, ep.notes 
       FROM entry_people ep
       JOIN people p ON ep.person_id = p.id
       WHERE ep.entry_id = $1`,
      [entryId]
    );
    return result.rows;
  }

  async removePersonFromEntry(entryId: string, personId: number) {
    const result = await this.pool.query(
      `DELETE FROM entry_people 
       WHERE entry_id = $1 AND person_id = $2
       RETURNING id`,
      [entryId, personId]
    );
    return result.rows[0];
  }
}