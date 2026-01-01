"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },
    password: {
        pepper: process.env.PASSWORD_PEPPER,
        saltRounds: 12,
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireMixedCase: true
    },
    server: {
        port: parseInt(process.env.PORT || '3003'),
        env: process.env.NODE_ENV || 'development'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};
//# sourceMappingURL=index.js.map