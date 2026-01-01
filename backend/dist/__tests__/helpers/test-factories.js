"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFactories = void 0;
// src/__tests__/helpers/test-factories.ts
const setup_1 = require("../setup"); // Используем тестовый пул из setup
const PasswordHasher_1 = require("../../modules/auth/services/PasswordHasher");
const crypto_1 = __importDefault(require("crypto"));
class TestFactories {
    // Используем правильный пул
    static get pool() {
        return setup_1.testPool;
    }
    /**
     * Создает тестового пользователя
     */
    static async createUser(overrides = {}) {
        const login = overrides.login || `test_user_${crypto_1.default.randomBytes(4).toString('hex')}`;
        const password = overrides.password || 'TestPassword123!';
        const passwordHash = await PasswordHasher_1.passwordHasher.hash(password);
        const backupCode = PasswordHasher_1.passwordHasher.generateBackupCode();
        const backupCodeHash = await PasswordHasher_1.passwordHasher.hashBackupCode(backupCode);
        const result = await this.pool.query(`INSERT INTO users (login, password_hash, backup_code_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, login, created_at`, [login, passwordHash, backupCodeHash]);
        return {
            ...result.rows[0],
            password, // возвращаем plain password для тестов
            backupCode,
        };
    }
    /**
     * Создает circumstance
     */
    static async createCircumstance(userId, overrides = {}) {
        const result = await this.pool.query(`INSERT INTO circumstances 
       (user_id, weather, temperature, moon_phase, global_event, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            userId,
            overrides.weather || 'sunny',
            overrides.temperature || 22,
            overrides.moon_phase || 'full',
            overrides.global_event || null,
            overrides.notes || null,
        ]);
        return result.rows[0];
    }
    /**
     * Создает body_state
     */
    static async createBodyState(userId, overrides = {}) {
        let locationPointSQL = null;
        if (overrides.location_point) {
            const { lat, lng } = overrides.location_point;
            locationPointSQL = `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
        }
        const query = `
      INSERT INTO body_states 
      (user_id, location_name, location_point, health_points, energy_points, circumstance_id)
      VALUES ($1, $2, ${locationPointSQL || 'NULL'}, $3, $4, $5)
      RETURNING *
    `;
        const result = await this.pool.query(query, [
            userId,
            overrides.location_name || 'Test Location',
            overrides.health_points || 80,
            overrides.energy_points || 70,
            overrides.circumstance_id || null,
        ]);
        return result.rows[0];
    }
    /**
     * Создает entry (запись)
     */
    static async createEntry(userId, overrides = {}) {
        const result = await this.pool.query(`INSERT INTO entries 
       (user_id, entry_type, content, body_state_id, circumstance_id, deadline, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            userId,
            overrides.entry_type || 'dream',
            overrides.content || 'Test entry content',
            overrides.body_state_id || null,
            overrides.circumstance_id || null,
            overrides.deadline || null,
            overrides.is_completed || false,
        ]);
        return result.rows[0];
    }
    static async getRandomEmotion() {
        try {
            const result = await this.pool.query(`SELECT * FROM emotions ORDER BY RANDOM() LIMIT 1`);
            if (result.rows.length === 0) {
                // Если эмоций нет (что не должно случиться после исправления setup)
                throw new Error('No emotions found in database. Check setup.');
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Error getting random emotion:', error);
            // Fallback на Joy если что-то пошло не так
            return {
                id: 1,
                name_en: 'Joy',
                name_ru: 'Радость',
                category: 'positive'
            };
        }
    }
    // В test-factories.ts исправьте метод addEmotionToEntry:
    static async addEmotionToEntry(entryId, emotionName, intensity = 5) {
        // Этот метод вероятно не используется, но если используется - исправьте
        console.warn('addEmotionToEntry is deprecated. Use API directly instead.');
        const emotionResult = await this.pool.query('SELECT id FROM emotions WHERE name_en ILIKE $1 OR name_ru ILIKE $1 LIMIT 1', [`%${emotionName}%`]);
        if (emotionResult.rows.length === 0) {
            throw new Error(`Emotion "${emotionName}" not found`);
        }
        const emotionId = emotionResult.rows[0].id;
        const result = await this.pool.query(`INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
     VALUES ($1, $2, $3)
     RETURNING *`, [entryId, emotionId, intensity]);
        return result.rows[0];
    }
    /**
     * Создает person
     */
    static async createPerson(userId, overrides = {}) {
        const name = overrides.name || `Test Person ${crypto_1.default.randomBytes(4).toString('hex')}`;
        const result = await this.pool.query(`INSERT INTO people (user_id, name, category, relationship, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [
            userId,
            name,
            overrides.category || 'friends',
            overrides.relationship || 'Friend',
            overrides.bio || 'Test bio',
        ]);
        return result.rows[0];
    }
    /**
     * Связывает entry с person
     */
    static async addPersonToEntry(entryId, personId, role) {
        const result = await this.pool.query(`INSERT INTO entry_people (entry_id, person_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`, [entryId, personId, role || 'participant']);
        return result.rows[0];
    }
    /**
     * Создает tag
     */
    static async createTag(userId, name) {
        const result = await this.pool.query('INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
        return result.rows[0];
    }
    static async cleanupTags(userId) {
        await this.pool.query('DELETE FROM tags WHERE user_id = $1', [userId]);
    }
    /**
     * Связывает entry с tag
     */
    static async addTagToEntry(entryId, tagId) {
        await this.pool.query(`INSERT INTO entry_tags (entry_id, tag_id)
       VALUES ($1, $2)`, [entryId, tagId]);
    }
    /**
     * Создает relation между entries
     */
    static async createEntryRelation(fromEntryId, toEntryId, relationType = 'related') {
        const result = await this.pool.query(`INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type)
       VALUES ($1, $2, $3)
       RETURNING *`, [fromEntryId, toEntryId, relationType]);
        return result.rows[0];
    }
    /**
     * Создает skill
     */
    static async createSkill(userId, overrides = {}) {
        const name = overrides.name || `Test Skill ${crypto_1.default.randomBytes(4).toString('hex')}`;
        const result = await this.pool.query(`INSERT INTO skills (user_id, name, category, current_level, experience_points)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [
            userId,
            name,
            overrides.category || 'general',
            overrides.current_level || 1,
            overrides.experience_points || 0,
        ]);
        return result.rows[0];
    }
    /**
     * Добавляет прогресс к skill
     */
    static async addSkillProgress(skillId, overrides = {}) {
        const result = await this.pool.query(`INSERT INTO skill_progress (skill_id, entry_id, body_state_id, experience_gained)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [
            skillId,
            overrides.entry_id || null,
            overrides.body_state_id || null,
            overrides.experience_gained || 10,
        ]);
        return result.rows[0];
    }
    /**
     * Очищает все данные пользователя
     */
    static async cleanupUser(userId) {
        await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    /**
     * Очищает все тестовые данные
     */
    static async cleanupAll() {
        const tables = [
            'ai_images',
            'ai_analysis',
            'skill_progress',
            'skills',
            'entry_relations',
            'entry_tags',
            'tags',
            'entry_people',
            'people',
            'entry_emotions',
            'emotions',
            'entries',
            'body_states',
            'circumstances',
            'users'
        ];
        for (const table of tables) {
            await this.pool.query(`DELETE FROM ${table} CASCADE`);
        }
    }
}
exports.TestFactories = TestFactories;
//# sourceMappingURL=test-factories.js.map