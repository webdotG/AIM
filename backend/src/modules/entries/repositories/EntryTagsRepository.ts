// src/modules/entries/repositories/EntryTagsRepository.ts
import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class EntryTagsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async addTagToEntry(entryId: string, tagId: number) {
    const result = await this.pool.query(
      `INSERT INTO entry_tags (entry_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT (entry_id, tag_id) DO NOTHING
       RETURNING *`,
      [entryId, tagId]
    );
    return result.rows[0];
  }

  async getTagsByEntryId(entryId: string) {
    const result = await this.pool.query(
      `SELECT t.* 
       FROM entry_tags et
       JOIN tags t ON et.tag_id = t.id
       WHERE et.entry_id = $1`,
      [entryId]
    );
    return result.rows;
  }

  async removeTagFromEntry(entryId: string, tagId: number) {
    const result = await this.pool.query(
      `DELETE FROM entry_tags 
       WHERE entry_id = $1 AND tag_id = $2
       RETURNING entry_id`,
      [entryId, tagId]
    );
    return result.rows[0];
  }
}