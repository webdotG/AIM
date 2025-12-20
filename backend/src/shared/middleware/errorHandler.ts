// src/shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation errors
  if (error.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.issues,
    });
    return;
  }

  // Prisma errors
  if (error.code?.startsWith('P')) {
    // Database errors
    res.status(500).json({
      success: false,
      error: 'Database error',
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

  // Default error
  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
  });
};