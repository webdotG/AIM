import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

interface EntryData {
  user_id: number;
  entry_type: string;
  content: string;
  body_state_id?: number | null;
  circumstance_id?: number | null;
  deadline?: Date | null;
  is_completed?: boolean;
}

export class EntriesRepository extends BaseRepository {
constructor(pool: Pool) {
  super(pool);
}

  async findByUserId(userId: number, filters: any = {}) {
    let query = `SELECT * FROM entries WHERE user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    // Фильтр по типу записи
    if (filters.entry_type) {
      query += ` AND entry_type = $${paramIndex}`;
      params.push(filters.entry_type);
      paramIndex++;
    }

    // Фильтр по дате создания (from)
    if (filters.from_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }

    // Фильтр по дате создания (to)
    if (filters.to_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    // Фильтр по body_state_id
    if (filters.body_state_id !== undefined) {
      if (filters.body_state_id === null) {
        query += ` AND body_state_id IS NULL`;
      } else {
        query += ` AND body_state_id = $${paramIndex}`;
        params.push(filters.body_state_id);
        paramIndex++;
      }
    }

    // Фильтр по circumstance_id
    if (filters.circumstance_id !== undefined) {
      if (filters.circumstance_id === null) {
        query += ` AND circumstance_id IS NULL`;
      } else {
        query += ` AND circumstance_id = $${paramIndex}`;
        params.push(filters.circumstance_id);
        paramIndex++;
      }
    }

    // Поиск по тексту (полнотекстовый)
    if (filters.search) {
      query += ` AND to_tsvector('russian', content) @@ plainto_tsquery('russian', $${paramIndex})`;
      params.push(filters.search);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    // Пагинация
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
      
      if (filters.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

async findById(id: string, userId?: number) {
  let query = `SELECT * FROM entries WHERE id = $1`;
  const params: any[] = [id];

  if (userId) {
    query += ` AND user_id = $2`;
    params.push(userId);
  }

  const result = await this.pool.query(query, params);
  return result.rows[0];
}

  async create(entryData: EntryData) {
    const result = await this.pool.query(
      `INSERT INTO entries (
        user_id, 
        entry_type, 
        content, 
        body_state_id,
        circumstance_id,
        deadline,
        is_completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        entryData.user_id,
        entryData.entry_type,
        entryData.content,
        entryData.body_state_id || null,
        entryData.circumstance_id || null,
        entryData.deadline || null,
        entryData.is_completed || false
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: any, userId: number) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Разрешённые поля для обновления
    const allowedFields = ['content', 'body_state_id', 'circumstance_id', 'deadline', 'is_completed'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Добавляем updated_at
    fields.push(`updated_at = NOW()`);
    
    // Добавляем условия WHERE
    values.push(id, userId);
    
    const query = `
      UPDATE entries 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteByUser(id: string, userId: number) {
    const result = await this.pool.query(
      `DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return result.rows[0];
  }

  async countByUserId(userId: number, filters: any = {}) {
    let query = `SELECT COUNT(*) FROM entries WHERE user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.entry_type) {
      query += ` AND entry_type = $${paramIndex}`;
      params.push(filters.entry_type);
      paramIndex++;
    }

    if (filters.from_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }

    if (filters.to_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}
