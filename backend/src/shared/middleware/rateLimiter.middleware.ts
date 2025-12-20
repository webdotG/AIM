// src/shared/middleware/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Общий лимитер для всех endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  keyGenerator: (req: Request) => {
    return req.userId?.toString() || req.ip || 'anonymous';
  },
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

// Строгий лимитер для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток входа
  keyGenerator: (req: Request) => req.body?.login || req.ip,
  message: {
    success: false,
    error: 'Too many login attempts'
  }
});