"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class SkillsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByUserId(userId, filters = {}) {
        let query = `SELECT * FROM skills WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;
        // Фильтр по категории
        if (filters.category) {
            query += ` AND category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }
        // Сортировка
        const sortMap = {
            level: 'current_level DESC',
            experience: 'experience_points DESC',
            name: 'name ASC',
            created_at: 'created_at DESC'
        };
        const sortBy = sortMap[filters.sort] || 'created_at DESC';
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
    async findById(id, userId) {
        let query = `SELECT * FROM skills WHERE id = $1`;
        const params = [id];
        if (userId) {
            query += ` AND user_id = $2`;
            params.push(userId);
        }
        const result = await this.pool.query(query, params);
        return result.rows[0];
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO skills (
        user_id, 
        name, 
        category,
        description,
        current_level,
        experience_points,
        icon,
        color
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`, [
            data.user_id,
            data.name,
            data.category || null,
            data.description || null,
            data.current_level || 1,
            data.experience_points || 0,
            data.icon || null,
            data.color || null
        ]);
        return result.rows[0];
    }
    async update(id, updates, userId) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'name',
            'category',
            'description',
            'current_level',
            'experience_points',
            'icon',
            'color'
        ];
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
        values.push(id, userId);
        const query = `
      UPDATE skills 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
    async deleteByUser(id, userId) {
        const result = await this.pool.query(`DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows[0];
    }
    async countByUserId(userId, filters = {}) {
        let query = `SELECT COUNT(*) FROM skills WHERE user_id = $1`;
        const params = [userId];
        let paramIndex = 2;
        if (filters.category) {
            query += ` AND category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }
        const result = await this.pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
    // ============ SKILL PROGRESS ============
    async addProgress(data) {
        const result = await this.pool.query(`INSERT INTO skill_progress (
        skill_id,
        entry_id,
        body_state_id,
        progress_type,
        experience_gained,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`, [
            data.skill_id,
            data.entry_id || null,
            data.body_state_id || null,
            data.progress_type,
            data.experience_gained,
            data.notes || null
        ]);
        return result.rows[0];
    }
    async getProgressHistory(skillId, limit = 50) {
        const result = await this.pool.query(`SELECT 
        sp.*,
        e.content as entry_content,
        e.entry_type as entry_type,
        bs.location_name as body_state_location
      FROM skill_progress sp
      LEFT JOIN entries e ON sp.entry_id = e.id
      LEFT JOIN body_states bs ON sp.body_state_id = bs.id
      WHERE sp.skill_id = $1
      ORDER BY sp.created_at DESC
      LIMIT $2`, [skillId, limit]);
        return result.rows;
    }
    async getTotalExperienceGained(skillId) {
        const result = await this.pool.query(`SELECT SUM(experience_gained) as total FROM skill_progress WHERE skill_id = $1`, [skillId]);
        return parseInt(result.rows[0].total || 0);
    }
    // Обновить experience и level навыка
    async updateExperienceAndLevel(skillId, experienceGained) {
        // Получаем текущий навык
        const skill = await this.pool.query(`SELECT current_level, experience_points FROM skills WHERE id = $1`, [skillId]);
        if (skill.rows.length === 0) {
            throw new Error('Skill not found');
        }
        const currentLevel = skill.rows[0].current_level;
        const currentExp = skill.rows[0].experience_points;
        const newExp = currentExp + experienceGained;
        // Рассчитываем новый уровень (простая формула: 100 опыта = 1 уровень)
        const newLevel = Math.min(100, Math.floor(1 + newExp / 100));
        const result = await this.pool.query(`UPDATE skills 
       SET experience_points = $1, current_level = $2
       WHERE id = $3
       RETURNING *`, [newExp, newLevel, skillId]);
        return {
            skill: result.rows[0],
            level_up: newLevel > currentLevel,
            levels_gained: newLevel - currentLevel
        };
    }
    // Получить все категории навыков пользователя
    async getCategories(userId) {
        const result = await this.pool.query(`SELECT DISTINCT category, COUNT(*) as count
       FROM skills 
       WHERE user_id = $1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`, [userId]);
        return result.rows;
    }
    // Топ навыков пользователя
    async getTopSkills(userId, limit = 10) {
        const result = await this.pool.query(`SELECT * FROM skills 
       WHERE user_id = $1 
       ORDER BY current_level DESC, experience_points DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
}
exports.SkillsRepository = SkillsRepository;
//# sourceMappingURL=SkillsRepository.js.map