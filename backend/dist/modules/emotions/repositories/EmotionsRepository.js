"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EmotionsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    // Получить все 27 эмоций из справочника
    async findAll() {
        const result = await this.pool.query(`SELECT * FROM emotions ORDER BY id ASC`);
        return result.rows;
    }
    // Получить эмоции по категории
    async findByCategory(category) {
        const result = await this.pool.query(`SELECT * FROM emotions WHERE category = $1 ORDER BY name_ru ASC`, [category]);
        return result.rows;
    }
    // Получить одну эмоцию по ID
    async findById(id) {
        const result = await this.pool.query(`SELECT * FROM emotions WHERE id = $1`, [id]);
        return result.rows[0];
    }
    // Получить эмоции для записи
    async getForEntry(entryId) {
        const result = await this.pool.query(`SELECT 
        ee.id,
        ee.emotion_id,
        ee.intensity,
        e.name_en,
        e.name_ru,
        e.category
      FROM entry_emotions ee
      JOIN emotions e ON ee.emotion_id = e.id
      WHERE ee.entry_id = $1
      ORDER BY ee.intensity DESC`, [entryId]);
        return result.rows;
    }
    // Привязать эмоции к записи
    async attachToEntry(entryId, emotions) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Удаляем старые эмоции
            await client.query(`DELETE FROM entry_emotions WHERE entry_id = $1`, [entryId]);
            // Добавляем новые
            for (const emotion of emotions) {
                await client.query(`INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
           VALUES ($1, $2, $3)`, [entryId, emotion.emotion_id, emotion.intensity]);
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Удалить все эмоции записи
    async detachFromEntry(entryId) {
        await this.pool.query(`DELETE FROM entry_emotions WHERE entry_id = $1`, [entryId]);
    }
    // Статистика по эмоциям пользователя
    async getUserEmotionStats(userId, fromDate, toDate) {
        let query = `
      SELECT 
        e.id as emotion_id,
        e.name_en,
        e.name_ru,
        e.category,
        COUNT(*) as count,
        AVG(ee.intensity) as avg_intensity,
        MAX(ee.intensity) as max_intensity
      FROM entry_emotions ee
      JOIN entries ent ON ee.entry_id = ent.id
      JOIN emotions e ON ee.emotion_id = e.id
      WHERE ent.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (fromDate) {
            query += ` AND ent.created_at >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            query += ` AND ent.created_at <= $${paramIndex}`;
            params.push(toDate);
            paramIndex++;
        }
        query += ` GROUP BY e.id, e.name_en, e.name_ru, e.category ORDER BY count DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    // Самые частые эмоции пользователя
    async getMostFrequent(userId, limit = 10) {
        const result = await this.pool.query(`SELECT 
        e.id,
        e.name_en,
        e.name_ru,
        e.category,
        COUNT(*) as count
      FROM entry_emotions ee
      JOIN entries ent ON ee.entry_id = ent.id
      JOIN emotions e ON ee.emotion_id = e.id
      WHERE ent.user_id = $1
      GROUP BY e.id, e.name_en, e.name_ru, e.category
      ORDER BY count DESC
      LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    // Распределение по категориям
    async getCategoryDistribution(userId, fromDate, toDate) {
        let query = `
      SELECT 
        e.category,
        COUNT(*) as count,
        AVG(ee.intensity) as avg_intensity
      FROM entry_emotions ee
      JOIN entries ent ON ee.entry_id = ent.id
      JOIN emotions e ON ee.emotion_id = e.id
      WHERE ent.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (fromDate) {
            query += ` AND ent.created_at >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            query += ` AND ent.created_at <= $${paramIndex}`;
            params.push(toDate);
            paramIndex++;
        }
        query += ` GROUP BY e.category ORDER BY count DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    // Эмоции по времени
    async getEmotionTimeline(userId, fromDate, toDate, granularity = 'day') {
        const dateFormat = {
            day: 'YYYY-MM-DD',
            week: 'IYYY-IW',
            month: 'YYYY-MM'
        }[granularity];
        const result = await this.pool.query(`SELECT 
        TO_CHAR(ent.created_at, $4) as period,
        e.category,
        COUNT(*) as count,
        AVG(ee.intensity) as avg_intensity
      FROM entry_emotions ee
      JOIN entries ent ON ee.entry_id = ent.id
      JOIN emotions e ON ee.emotion_id = e.id
      WHERE ent.user_id = $1
        AND ent.created_at >= $2
        AND ent.created_at <= $3
      GROUP BY period, e.category
      ORDER BY period ASC`, [userId, fromDate, toDate, dateFormat]);
        return result.rows;
    }
}
exports.EmotionsRepository = EmotionsRepository;
//# sourceMappingURL=EmotionsRepository.js.map