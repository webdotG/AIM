"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.generalLimiter = void 0;
// src/shared/middleware/rateLimiter.middleware.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Общий лимитер для всех endpoints
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // 100 запросов
    keyGenerator: (req) => {
        return req.userId?.toString() || req.ip || 'anonymous';
    },
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    }
});
// Строгий лимитер для аутентификации
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // 5 попыток входа
    keyGenerator: (req) => req.body?.login || req.ip,
    message: {
        success: false,
        error: 'Too many login attempts'
    }
});
//# sourceMappingURL=rateLimiter.middleware.js.map