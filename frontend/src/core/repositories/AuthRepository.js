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

  isAuthenticated() {
    // throw new Error('Not implemented'); 
    //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    return true
  }
}