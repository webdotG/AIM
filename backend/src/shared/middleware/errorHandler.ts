// src/shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Не логируем в тестовом окружении
  if (process.env.NODE_ENV !== 'test') {
    logger.error('Unhandled error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Обработка AppError
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(error && { details: error })
    });
    return;
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.issues,
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expired',
    });
    return;
  }

  // UUID in error message (catches PostgreSQL UUID parse errors)
  if (error.message && error.message.toLowerCase().includes('uuid')) {
    res.status(404).json({
      success: false,
      error: 'Not found',
    });
    return;
  }

  // PostgreSQL errors
  if (error.name === 'invalid_input_syntax' ||
    error.code === '22P02' ||
    error.code === '23505' ||
    error.code === '23503' ||
    error.code === '23514' ||
    error.code === '23502') {
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Conflict',
      });
    } else if (error.code === '23503') {
      res.status(404).json({
        success: false,
        error: 'Resource not found',
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message || 'Bad request',
      });
    }
    return;
  }

  // Default error
  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
  });
};