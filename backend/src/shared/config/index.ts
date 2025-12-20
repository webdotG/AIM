const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.warn('WARNING: JWT_SECRET is not set. Using default (INSECURE!).');
}

export default {
  jwt: {
    secret: jwtSecret || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  password: {
    pepper: process.env.PASSWORD_PEPPER || 'default-pepper-change-me',
    saltRounds: 12,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dream_journal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
};
