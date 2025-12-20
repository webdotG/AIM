import { UserRepository } from '../repositories/UserRepository';
import { passwordHasher } from './PasswordHasher';
import { jwtService } from './JWTService';
import { RegisterInput, LoginInput, UpdatePasswordInput } from '../schemas/auth.schema';
import { query } from '../../../db/query';

interface User {
  id: number;
  login: string;
  password_hash: string;
  backup_code_hash?: string;
  created_at: Date;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
  ) {}

  async register(input: RegisterInput): Promise<{
    user: { id: number; login: string };
    token: string;
    backupCode: string;
  }> {
    const { login, password } = input;

    // Проверка силы пароля
    const strength = passwordHasher.checkStrength(password);
    if (!strength.isStrong) {
      throw new Error('Password is too weak');
    }

    // Проверка уникальности логина
    const exists = await this.userRepository.existsByLogin(login);
    if (exists) {
      throw new Error('Login already taken');
    }

    // Хеширование пароля
    const passwordHash = await passwordHasher.hash(password);

    // Генерация backup-кода
    const backupCode = passwordHasher.generateBackupCode();
    const backupCodeHash = await passwordHasher.hashBackupCode(backupCode);

    // Создание пользователя
    const user = await this.userRepository.create({
      login,
      password_hash: passwordHash,
      backup_code_hash: backupCodeHash,
    });

    // Генерация токена
    const token = jwtService.sign({
      userId: user.id,
      login: user.login,
    });

    console.log(`User registered: ${user.login} (ID: ${user.id})`);

    return {
      user: {
        id: user.id,
        login: user.login,
      },
      token,
      backupCode,
    };
  }

  async login(input: LoginInput): Promise<{
    user: { id: number; login: string };
    token: string;
  }> {
    const { login, password } = input;
    const startTime = Date.now();

    try {
      const user = await this.userRepository.findByLogin(login);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await passwordHasher.verify(password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwtService.sign({
        userId: user.id,
        login: user.login,
      });

      console.log(`User logged in: ${user.login} (ID: ${user.id})`);

      return {
        user: {
          id: user.id,
          login: user.login,
        },
        token,
      };
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await this.delay(500 - elapsed);
      }
    }
  }

  async updatePassword(input: UpdatePasswordInput): Promise<{
    user: { id: number; login: string };
    token: string;
    backupCode: string;
  }> {
    const { backupCode, newPassword } = input;

    // Поиск пользователя по backup-коду
    const users = await query<User>(`
      SELECT * FROM users WHERE backup_code_hash IS NOT NULL
    `);
    
    let foundUser: User | null = null;
    
    for (const user of users) {
      if (user.backup_code_hash) {
        const isValid = await passwordHasher.verifyBackupCode(
          backupCode,
          user.backup_code_hash
        );
        if (isValid) {
          foundUser = user;
          break;
        }
      }
    }
    
    if (!foundUser) {
      throw new Error('Invalid backup code');
    }

    // Проверка силы нового пароля
    const strength = passwordHasher.checkStrength(newPassword);
    if (!strength.isStrong) {
      throw new Error('New password is too weak');
    }

    // Хеширование нового пароля
    const passwordHash = await passwordHasher.hash(newPassword);

    // Генерация нового backup-кода
    const newBackupCode = passwordHasher.generateBackupCode();
    const newBackupCodeHash = await passwordHasher.hashBackupCode(newBackupCode);

    // Обновление пользователя
    await this.userRepository.update(foundUser.id, {
      password_hash: passwordHash,
      backup_code_hash: newBackupCodeHash,
    });

    // Генерация нового токена
    const token = jwtService.sign({
      userId: foundUser.id,
      login: foundUser.login,
    });

    console.log(`Password updated for user: ${foundUser.login} (ID: ${foundUser.id})`);

    return {
      user: {
        id: foundUser.id,
        login: foundUser.login,
      },
      token,
      backupCode: newBackupCode,
    };
  }

  async validateToken(token: string): Promise<{ id: number; login: string } | null> {
    try {
      const payload = jwtService.verify(token);
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        login: user.login,
      };
    } catch (error) {
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
