import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../src/config/jwt';
import { jwtBlacklist } from '../../redis/jwtBlacklist';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userLogin?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      
      // Extract user ID from token
      const userId = decoded.userId || decoded.user_id || decoded.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Token does not contain user ID'
        });
      }

      // Check if token is blacklisted (revoked)
      const jti = decoded.jti;
      if (jti) {
        const isRevoked = await jwtBlacklist.isBlacklisted(jti as string);
        if (isRevoked) {
          return res.status(401).json({
            success: false,
            error: 'Token has been revoked'
          });
        }
      }
      
      // Set user ID on request
      req.userId = userId;
      
      next();
    } catch (verifyError: any) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};