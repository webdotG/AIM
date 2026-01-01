// src/modules/entries/repositories/EntryEmotionsRepository.ts
import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class EntryEmotionsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async addEmotionToEntry(entryId: string, emotionId: number, intensity: number) {
    const result = await this.pool.query(
      `INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [entryId, emotionId, intensity]
    );
    return result.rows[0];
  }

  async getEmotionsByEntryId(entryId: string) {
    const result = await this.pool.query(
      `SELECT e.*, ee.intensity 
       FROM entry_emotions ee
       JOIN emotions e ON ee.emotion_id = e.id
       WHERE ee.entry_id = $1`,
      [entryId]
    );
    return result.rows;
  }

  async removeEmotionFromEntry(entryId: string, emotionId: number) {
    const result = await this.pool.query(
      `DELETE FROM entry_emotions 
       WHERE entry_id = $1 AND emotion_id = $2
       RETURNING id`,
      [entryId, emotionId]
    );
    return result.rows[0];
  }
}