// src/__tests__/helpers/test-factories.ts
import { testPool } from '../setup'; // Используем тестовый пул из setup
import { passwordHasher } from '../../modules/auth/services/PasswordHasher';
import crypto from 'crypto';

export class TestFactories {
  // Используем правильный пул
  private static get pool() {
    return testPool;
  }

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

    const result = await this.pool.query(
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
    const result = await this.pool.query(
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
  static async createEntry(userId: number, overrides: {
    entry_type?: 'dream' | 'memory' | 'thought' | 'plan';
    content?: string;
    body_state_id?: number;
    circumstance_id?: number;
    deadline?: Date;
    is_completed?: boolean;
  } = {}) {
    const result = await this.pool.query(
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

static async getRandomEmotion() {
  try {
    const result = await this.pool.query(
      `SELECT * FROM emotions ORDER BY RANDOM() LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      // Если эмоций нет (что не должно случиться после исправления setup)
      throw new Error('No emotions found in database. Check setup.');
    }
    
    return result.rows[0];
  } catch (error) {
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
static async addEmotionToEntry(entryId: string, emotionName: string, intensity: number = 5) {
  // Этот метод вероятно не используется, но если используется - исправьте
  console.warn('addEmotionToEntry is deprecated. Use API directly instead.');
  
  const emotionResult = await this.pool.query(
    'SELECT id FROM emotions WHERE name_en ILIKE $1 OR name_ru ILIKE $1 LIMIT 1',
    [`%${emotionName}%`]
  );
  
  if (emotionResult.rows.length === 0) {
    throw new Error(`Emotion "${emotionName}" not found`);
  }
  
  const emotionId = emotionResult.rows[0].id;
  
  const result = await this.pool.query(
    `INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [entryId, emotionId, intensity]
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
    
    const result = await this.pool.query(
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
    const result = await this.pool.query(
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
  static async createTag(userId: number, name: string) {
    const result = await this.pool.query(
      'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    return result.rows[0];
  }

  static async cleanupTags(userId: number) {
    await this.pool.query('DELETE FROM tags WHERE user_id = $1', [userId]);
  }

  /**
   * Связывает entry с tag
   */
  static async addTagToEntry(entryId: string, tagId: number) {
    await this.pool.query(
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
    const result = await this.pool.query(
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
    
    const result = await this.pool.query(
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
    const result = await this.pool.query(
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