import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { Emotion, EmotionCategory } from '../../../shared/types';

export class EmotionsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<Emotion[]> {
    const result = await this.pool.query('SELECT id, code, name_ru, name_en, category FROM emotions ORDER BY category, name_en');
    return result.rows;
  }

  async findByCategory(category: EmotionCategory): Promise<Emotion[]> {
    const result = await this.pool.query(
      'SELECT id, code, name_ru, name_en, category FROM emotions WHERE category = $1 ORDER BY name_en',
      [category]
    );
    return result.rows;
  }

  async findById(id: number): Promise<Emotion | null> {
    const result = await this.pool.query(
      'SELECT id, code, name_ru, name_en, category FROM emotions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}