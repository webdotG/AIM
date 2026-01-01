// src/__tests__/helpers/test-factories.ts
import { pool } from '../../db/pool';
import { passwordHasher } from '../../modules/auth/services/PasswordHasher';
import crypto from 'crypto';

export class TestFactories {
  /**
   * Создает тестового пользователя
   */
  static async createUser(overrides: {
    login?: string;
    password?: string;
  } = {}) {
    const login = overrides.login || `test_user_${crypto.randomBytes(4).toString('hex')}`;
    const password = overrides.password || 'TestPassword123!';
    
    const passwordHash = await passwordHasher.hash(password);
    const backupCode = passwordHasher.generateBackupCode();
    const backupCodeHash = await passwordHasher.hashBackupCode(backupCode);

    const result = await pool.query(
      `INSERT INTO users (login, password_hash, backup_code_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, login, created_at`,
      [login, passwordHash, backupCodeHash]
    );

    return {
      ...result.rows[0],
      password, // возвращаем plain password для тестов
      backupCode,
    };
  }

  /**
   * Создает circumstance
   */
  static async createCircumstance(userId: number, overrides: {
    weather?: string;
    temperature?: number;
    moon_phase?: string;
    global_event?: string;
    notes?: string;
  } = {}) {
    const result = await pool.query(
      `INSERT INTO circumstances 
       (user_id, weather, temperature, moon_phase, global_event, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        overrides.weather || 'sunny',
        overrides.temperature || 22,
        overrides.moon_phase || 'full',
        overrides.global_event || null,
        overrides.notes || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Создает body_state
   */
  static async createBodyState(userId: number, overrides: {
    location_name?: string;
    location_point?: { lat: number; lng: number };
    health_points?: number;
    energy_points?: number;
    circumstance_id?: number;
  } = {}) {
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

    const result = await pool.query(query, [
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
  static async createEntry(userId: number, overrides: {
    entry_type?: 'dream' | 'memory' | 'thought' | 'plan';
    content?: string;
    body_state_id?: number;
    circumstance_id?: number;
    deadline?: Date;
    is_completed?: boolean;
  } = {}) {
    const result = await pool.query(
      `INSERT INTO entries 
       (user_id, entry_type, content, body_state_id, circumstance_id, deadline, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        overrides.entry_type || 'dream',
        overrides.content || 'Test entry content',
        overrides.body_state_id || null,
        overrides.circumstance_id || null,
        overrides.deadline || null,
        overrides.is_completed || false,
      ]
    );

    return result.rows[0];
  }

  /**
   * Создает эмоцию для entry
   */
  static async addEmotionToEntry(entryId: string, emotionId: number, intensity: number = 5) {
    const result = await pool.query(
      `INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [entryId, emotionId, intensity]
    );

    return result.rows[0];
  }

  /**
   * Получить случайную эмоцию
   */
  static async getRandomEmotion() {
    const result = await pool.query(
      `SELECT * FROM emotions ORDER BY RANDOM() LIMIT 1`
    );
    return result.rows[0];
  }

  /**
   * Создает person
   */
  static async createPerson(userId: number, overrides: {
    name?: string;
    category?: 'family' | 'friends' | 'acquaintances' | 'strangers';
    relationship?: string;
    bio?: string;
  } = {}) {
    const name = overrides.name || `Test Person ${crypto.randomBytes(4).toString('hex')}`;
    
    const result = await pool.query(
      `INSERT INTO people (user_id, name, category, relationship, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        name,
        overrides.category || 'friends',
        overrides.relationship || 'Friend',
        overrides.bio || 'Test bio',
      ]
    );

    return result.rows[0];
  }

  /**
   * Связывает entry с person
   */
  static async addPersonToEntry(entryId: string, personId: number, role?: string) {
    const result = await pool.query(
      `INSERT INTO entry_people (entry_id, person_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [entryId, personId, role || 'participant']
    );

    return result.rows[0];
  }

  /**
   * Создает tag
   */
  // static async createTag(userId: number, name?: string) {
  //   const tagName = name || `test_tag_${crypto.randomBytes(4).toString('hex')}`;
    
  //   const result = await pool.query(
  //     `INSERT INTO tags (user_id, name)
  //      VALUES ($1, $2)
  //      RETURNING *`,
  //     [userId, tagName]
  //   );

  //   return result.rows[0];
  // }
    static async createTag(userId: number, name: string, data?: Partial<any>) {

    // const tagsRepository = new TagsRepository(pool);
    // return await tagsRepository.create({
    //   user_id: userId,
    //   name,
    //   ...data
    // });
    
    const result = await pool.query(
      'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    return result.rows[0];
  }

  static async cleanupTags(userId: number) {
    await pool.query('DELETE FROM tags WHERE user_id = $1', [userId]);
  }

  /**
   * Связывает entry с tag
   */
  static async addTagToEntry(entryId: string, tagId: number) {
    await pool.query(
      `INSERT INTO entry_tags (entry_id, tag_id)
       VALUES ($1, $2)`,
      [entryId, tagId]
    );
  }

  /**
   * Создает relation между entries
   */
  static async createEntryRelation(
    fromEntryId: string,
    toEntryId: string,
    relationType: string = 'related'
  ) {
    const result = await pool.query(
      `INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [fromEntryId, toEntryId, relationType]
    );

    return result.rows[0];
  }

  /**
   * Создает skill
   */
  static async createSkill(userId: number, overrides: {
    name?: string;
    category?: string;
    current_level?: number;
    experience_points?: number;
  } = {}) {
    const name = overrides.name || `Test Skill ${crypto.randomBytes(4).toString('hex')}`;
    
    const result = await pool.query(
      `INSERT INTO skills (user_id, name, category, current_level, experience_points)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        name,
        overrides.category || 'general',
        overrides.current_level || 1,
        overrides.experience_points || 0,
      ]
    );

    return result.rows[0];
  }

  /**
   * Добавляет прогресс к skill
   */
  static async addSkillProgress(skillId: number, overrides: {
    entry_id?: string;
    body_state_id?: number;
    experience_gained?: number;
  } = {}) {
    const result = await pool.query(
      `INSERT INTO skill_progress (skill_id, entry_id, body_state_id, experience_gained)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        skillId,
        overrides.entry_id || null,
        overrides.body_state_id || null,
        overrides.experience_gained || 10,
      ]
    );

    return result.rows[0];
  }

  /**
   * Очищает все данные пользователя
   */
  static async cleanupUser(userId: number) {
    // Благодаря CASCADE всё удалится автоматически
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  /**
   * Очищает все тестовые данные
   */
  static async cleanupAll() {
    await pool.query("DELETE FROM users WHERE login LIKE 'test_%'");
  }
}