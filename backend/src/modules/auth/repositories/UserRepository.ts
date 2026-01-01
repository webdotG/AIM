import { query, queryOne } from '../../../db/query';

export class UserRepository {
  async existsByLogin(login: string): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE login = $1)',
      [login]
    );
    return result?.exists || false;
  }

  async findByLogin(login: string): Promise<any> {
    return queryOne(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );
  }

  async findById(id: number): Promise<any> {
    return queryOne(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  }

  async create(data: { login: string; password_hash: string; backup_code_hash: string }): Promise<any> {
    const result = await query(
      'INSERT INTO users (login, password_hash, backup_code_hash) VALUES ($1, $2, $3) RETURNING *',
      [data.login, data.password_hash, data.backup_code_hash]
    );
    return result[0];
  }

  async update(id: number, data: { password_hash: string; backup_code_hash: string }): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, backup_code_hash = $2 WHERE id = $3',
      [data.password_hash, data.backup_code_hash, id]
    );
  }

async findAll(): Promise<any[]> {
  try {
    const result = await query('SELECT * FROM users');
    return result;
  } catch (error) {
    console.error('Error in findAll:', error);
    return [];
  }
}
}