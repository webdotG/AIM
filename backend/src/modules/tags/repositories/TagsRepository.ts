import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

interface TagData {
  user_id: number;
  name: string;
}

export class TagsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super('tags', pool);
  }

  // Получить все теги пользователя
  async findByUserId(userId: number, filters: any = {}) {
    let query = `
      SELECT 
        t.*,
        COUNT(et.entry_id) as usage_count
      FROM tags t
      LEFT JOIN entry_tags et ON t.id = et.tag_id
      WHERE t.user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    // Поиск по имени
    if (filters.search) {
      query += ` AND t.name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` GROUP BY t.id, t.user_id, t.name, t.created_at`;

    // Сортировка
    const sortMap: any = {
      name: 't.name ASC',
      usage: 'usage_count DESC',
      created_at: 't.created_at DESC'
    };
    
    const sortBy = sortMap[filters.sort] || 't.name ASC';
    query += ` ORDER BY ${sortBy}`;

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

  // Найти тег по ID
  async findById(id: number, userId?: number) {
    let query = `
      SELECT 
        t.*,
        COUNT(et.entry_id) as usage_count
      FROM tags t
      LEFT JOIN entry_tags et ON t.id = et.tag_id
      WHERE t.id = $1
    `;
    
    const params: any[] = [id];

    if (userId) {
      query += ` AND t.user_id = $2`;
      params.push(userId);
    }

    query += ` GROUP BY t.id, t.user_id, t.name, t.created_at`;

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Найти тег по имени
  async findByName(userId: number, name: string) {
    const result = await this.pool.query(
      `SELECT * FROM tags WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
      [userId, name]
    );
    return result.rows[0];
  }

  // Создать тег
  async create(data: TagData) {
    const result = await this.pool.query(
      `INSERT INTO tags (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [data.user_id, data.name]
    );
    return result.rows[0];
  }

  // Обновить тег
  async update(id: number, name: string, userId: number) {
    const result = await this.pool.query(
      `UPDATE tags 
       SET name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [name, id, userId]
    );
    return result.rows[0];
  }

  // Удалить тег
  async deleteByUser(id: number, userId: number) {
    const result = await this.pool.query(
      `DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return result.rows[0];
  }

  // Подсчёт тегов
  async countByUserId(userId: number, filters: any = {}) {
    let query = `SELECT COUNT(DISTINCT t.id) FROM tags t WHERE t.user_id = $1`;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.search) {
      query += ` AND t.name ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // ============ TAGS FOR ENTRIES ============

  // Получить теги для записи
  async getForEntry(entryId: string) {
    const result = await this.pool.query(
      `SELECT t.*
       FROM tags t
       JOIN entry_tags et ON t.id = et.tag_id
       WHERE et.entry_id = $1
       ORDER BY t.name ASC`,
      [entryId]
    );
    return result.rows;
  }

  // Привязать теги к записи
  async attachToEntry(entryId: string, tagIds: number[]) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Удаляем старые теги
      await client.query(
        `DELETE FROM entry_tags WHERE entry_id = $1`,
        [entryId]
      );

      // Добавляем новые
      for (const tagId of tagIds) {
        await client.query(
          `INSERT INTO entry_tags (entry_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [entryId, tagId]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Отвязать все теги от записи
  async detachFromEntry(entryId: string) {
    await this.pool.query(
      `DELETE FROM entry_tags WHERE entry_id = $1`,
      [entryId]
    );
  }

  // Найти записи по тегу
  async getEntriesByTag(tagId: number, userId: number, limit: number = 50) {
    const result = await this.pool.query(
      `SELECT e.*
       FROM entries e
       JOIN entry_tags et ON e.id = et.entry_id
       WHERE et.tag_id = $1 AND e.user_id = $2
       ORDER BY e.created_at DESC
       LIMIT $3`,
      [tagId, userId, limit]
    );
    return result.rows;
  }

  // Самые используемые теги
  async getMostUsed(userId: number, limit: number = 20) {
    const result = await this.pool.query(
      `SELECT 
        t.*,
        COUNT(et.entry_id) as usage_count
       FROM tags t
       LEFT JOIN entry_tags et ON t.id = et.tag_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.user_id, t.name, t.created_at
       HAVING COUNT(et.entry_id) > 0
       ORDER BY usage_count DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // Неиспользуемые теги
  async getUnused(userId: number) {
    const result = await this.pool.query(
      `SELECT t.*
       FROM tags t
       LEFT JOIN entry_tags et ON t.id = et.tag_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.user_id, t.name, t.created_at
       HAVING COUNT(et.entry_id) = 0
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Создать или найти тег по имени (для автодополнения)
  async findOrCreate(userId: number, name: string) {
    // Сначала ищем
    let tag = await this.findByName(userId, name);
    
    // Если нет - создаём
    if (!tag) {
      tag = await this.create({ user_id: userId, name });
    }

    return tag;
  }

  // Получить похожие теги (для рекомендаций)
  async getSimilar(userId: number, tagId: number, limit: number = 5) {
    const result = await this.pool.query(
      `SELECT DISTINCT t2.*, COUNT(*) as co_occurrence
       FROM entry_tags et1
       JOIN entry_tags et2 ON et1.entry_id = et2.entry_id
       JOIN tags t2 ON et2.tag_id = t2.id
       WHERE et1.tag_id = $1 
         AND et2.tag_id != $1
         AND t2.user_id = $2
       GROUP BY t2.id, t2.user_id, t2.name, t2.created_at
       ORDER BY co_occurrence DESC
       LIMIT $3`,
      [tagId, userId, limit]
    );
    return result.rows;
  }
}
