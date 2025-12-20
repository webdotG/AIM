export class User {
  constructor(data) {
    this.id = data.id;
    this.login = data.login;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
  }
}
