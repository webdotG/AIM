import { BaseRepository } from "./base/BaseRepository";

export class AuthRepository extends BaseRepository {
  async register(login, password) {
    throw new Error('Not implemented');
  }

  async login(login, password) {
    throw new Error('Not implemented');
  }

  async recover(login, backupCode, newPassword) {
    throw new Error('Not implemented');
  }

  async logout() {
    throw new Error('Not implemented');
  }


  async checkPasswordStrength(password) {
    throw new Error('Not implemented');
  }

  async generatePasswordRecommendation() {
    throw new Error('Not implemented');
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    isAuthenticated() {
    return true; // для тестов
  }
}