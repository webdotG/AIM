import { pool } from '../../db/pool';
import { passwordHasher } from '../../modules/auth/services/PasswordHasher';
import crypto from 'crypto';

export class TestFactories {
  static async createUser(overrides: { login?: string; password?: string } = {}) {
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

    return { ...result.rows[0], password, backupCode };
  }

  static async createNode(userId: number, nodeTypeCode: string = 'conversation', title: string = 'Test node') {
    const typeResult = await pool.query('SELECT id FROM node_types WHERE code = $1', [nodeTypeCode]);
    if (typeResult.rows.length === 0) throw new Error(`Node type "${nodeTypeCode}" not found`);

    const result = await pool.query(
      `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [userId, typeResult.rows[0].id, title]
    );
    return result.rows[0];
  }

  static async createDream(userId: number, overrides: { title?: string; content?: string; dream_date?: string; lucidity?: number; vividness?: number; nightmare?: boolean } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['dream']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, overrides.title || 'Test Dream']
      );
      const node = nodeResult.rows[0];
      const dreamResult = await client.query(
        `INSERT INTO dreams (node_id, content, dream_date, lucidity, vividness, nightmare)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [node.id, overrides.content || 'Test dream content', overrides.dream_date || new Date().toISOString(), overrides.lucidity || null, overrides.vividness || null, overrides.nightmare || false]
      );
      await client.query('COMMIT');
      return { ...dreamResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createThought(userId: number, overrides: { title?: string; content?: string; importance?: number; confidence?: number } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['thought']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, overrides.title || 'Test Thought']
      );
      const node = nodeResult.rows[0];
      const thoughtResult = await client.query(
        `INSERT INTO thoughts (node_id, content, importance, confidence)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [node.id, overrides.content || 'Test thought content', overrides.importance || null, overrides.confidence || null]
      );
      await client.query('COMMIT');
      return { ...thoughtResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createMemory(userId: number, overrides: { title?: string; content?: string; event_date?: string; confidence?: number } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['memory']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, overrides.title || 'Test Memory']
      );
      const node = nodeResult.rows[0];
      const memoryResult = await client.query(
        `INSERT INTO memories (node_id, content, event_date, confidence)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [node.id, overrides.content || 'Test memory content', overrides.event_date || null, overrides.confidence || null]
      );
      await client.query('COMMIT');
      return { ...memoryResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createPlan(userId: number, overrides: { title?: string; description?: string; deadline?: string; priority?: number; completed?: boolean } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['plan']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, overrides.title || 'Test Plan']
      );
      const node = nodeResult.rows[0];
      const planResult = await client.query(
        `INSERT INTO plans (node_id, description, deadline, priority, completed)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [node.id, overrides.description || 'Test plan description', overrides.deadline || null, overrides.priority || null, overrides.completed || false]
      );
      await client.query('COMMIT');
      return { ...planResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createAction(userId: number, overrides: { title?: string; description?: string; activity_id?: number; started_at?: string; finished_at?: string } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['action']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, overrides.title || 'Test Action']
      );
      const node = nodeResult.rows[0];
      const actionResult = await client.query(
        `INSERT INTO actions (node_id, activity_id, started_at, finished_at, description)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [node.id, overrides.activity_id || null, overrides.started_at || new Date().toISOString(), overrides.finished_at || null, overrides.description || 'Test action description']
      );
      await client.query('COMMIT');
      return { ...actionResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createPerson(userId: number, overrides: { title?: string; full_name?: string; nickname?: string; birth_date?: string; relationship?: string; notes?: string } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const name = overrides.full_name || overrides.title || `Test Person ${crypto.randomBytes(4).toString('hex')}`;
      const typeResult = await client.query('SELECT id FROM node_types WHERE code = $1', ['person']);
      const nodeResult = await client.query(
        `INSERT INTO nodes (user_id, node_type_id, title, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [userId, typeResult.rows[0].id, name]
      );
      const node = nodeResult.rows[0];
      const peopleResult = await client.query(
        `INSERT INTO people (node_id, full_name, nickname, birth_date, relationship, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [node.id, name, overrides.nickname || null, overrides.birth_date || null, overrides.relationship || 'Friend', overrides.notes || 'Test bio']
      );
      await client.query('COMMIT');
      return { ...peopleResult.rows[0], node };
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  static async createEdge(fromNodeId: string, toNodeId: string, edgeTypeCode: string = 'related_to', confidence: number = 0.8, weight: number = 1) {
    const typeResult = await pool.query('SELECT id FROM edge_types WHERE code = $1', [edgeTypeCode]);
    if (typeResult.rows.length === 0) throw new Error(`Edge type "${edgeTypeCode}" not found`);

    const result = await pool.query(
      `INSERT INTO edges (from_node_id, to_node_id, edge_type_id, confidence, weight, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [fromNodeId, toNodeId, typeResult.rows[0].id, confidence, weight]
    );
    return result.rows[0];
  }

  static async findEmotion(code: string) {
    const result = await pool.query('SELECT * FROM emotions WHERE code = $1 OR name_en ILIKE $1 LIMIT 1', [code]);
    if (result.rows.length === 0) throw new Error(`Emotion "${code}" not found`);
    return result.rows[0];
  }

  static async getRandomEmotion() {
    const result = await pool.query('SELECT * FROM emotions ORDER BY RANDOM() LIMIT 1');
    return result.rows[0] || { id: 1, code: 'joy', name_en: 'Joy', name_ru: 'Радость', category: 'positive' };
  }

  static async addEmotionToNode(nodeId: string, emotionName: string, intensity: number = 5) {
    const emotion = await this.findEmotion(emotionName);
    const result = await pool.query(
      `INSERT INTO node_emotions (node_id, emotion_id, intensity)
       VALUES ($1, $2, $3)
       ON CONFLICT (node_id, emotion_id) DO UPDATE SET intensity = EXCLUDED.intensity
       RETURNING *`,
      [nodeId, emotion.id, intensity]
    );
    return result.rows[0];
  }

  static async removeEmotionsFromNode(nodeId: string) {
    await pool.query('DELETE FROM node_emotions WHERE node_id = $1', [nodeId]);
  }

  static async createTag(userId: number, name: string) {
    const result = await pool.query('INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *', [userId, name]);
    return result.rows[0];
  }

  static async addTagToNode(nodeId: string, tagId: number) {
    await pool.query('INSERT INTO node_tags (node_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [nodeId, tagId]);
  }

  static async removeTagsFromNode(nodeId: string) {
    await pool.query('DELETE FROM node_tags WHERE node_id = $1', [nodeId]);
  }

  static async createMeasurementDefinition(overrides: { code?: string; name?: string; data_type?: 'integer' | 'decimal' | 'boolean' | 'text'; default_unit?: string } = {}) {
    const result = await pool.query(
      `INSERT INTO measurement_definitions (code, name, data_type, default_unit)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO NOTHING RETURNING *`,
      [overrides.code || `test_measure_${crypto.randomBytes(4).toString('hex')}`, overrides.name || 'Test Measurement', overrides.data_type || 'integer', overrides.default_unit || null]
    );
    return result.rows[0];
  }

  static async cleanupUser(userId: number) {
    try {
      // Clean up AI tables first (they have ON DELETE RESTRICT)
      await pool.query(`
        DELETE FROM ai_analysis WHERE node_id IN (SELECT id FROM nodes WHERE user_id = $1)
      `, [userId]);
      await pool.query(`
        DELETE FROM ai_images WHERE node_id IN (SELECT id FROM nodes WHERE user_id = $1)
      `, [userId]);
      // Delete user (CASCADE will clean up nodes, edges, etc.)
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    } catch {
      // Ignore cleanup errors — user may already be deleted
    }
  }

  static async cleanupNode(nodeId: string) {
    await pool.query('UPDATE nodes SET deleted_at = NOW() WHERE id = $1', [nodeId]);
  }
}