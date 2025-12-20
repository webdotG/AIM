import bcrypt from 'bcrypt';
import config from '../../../shared/config';

export class PasswordHasher {
  private readonly pepper = config.password.pepper;
  private readonly saltRounds = config.password.saltRounds;

  async hash(password: string): Promise<string> {
    const pepperedPassword = password + this.pepper;
    return bcrypt.hash(pepperedPassword, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const pepperedPassword = password + this.pepper;
    return bcrypt.compare(pepperedPassword, hash);
  }

  generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async hashBackupCode(backupCode: string): Promise<string> {
    return bcrypt.hash(backupCode, this.saltRounds);
  }

  async verifyBackupCode(backupCode: string, hash: string): Promise<boolean> {
    return bcrypt.compare(backupCode, hash);
  }

  checkStrength(password: string): { isStrong: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (password.length < 8) reasons.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) reasons.push('Password must contain uppercase letter');
    if (!/[a-z]/.test(password)) reasons.push('Password must contain lowercase letter');
    if (!/\d/.test(password)) reasons.push('Password must contain number');
    
    return {
      isStrong: reasons.length === 0,
      reasons
    };
  }
}

export const passwordHasher = new PasswordHasher();
