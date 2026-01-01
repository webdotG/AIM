import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../src/config/jwt';

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
    // console.log('=== AUTHENTICATE START ===');
    
    const authHeader = req.headers.authorization;
    // console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // console.log('No Bearer token');
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    // console.log('Token extracted:', token.substring(0, 20) + '...');
    
    // 1. Сначала декодируем без проверки
    const decodedWithoutVerify = jwt.decode(token);
    // console.log('Decoded (no verify):', decodedWithoutVerify);
    
    // 2. Проверяем что JWT_SECRET существует
    // console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    // console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    try {
      // 3. Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      // console.log('Decoded (verified):', decoded);
      
      // 4. Ищем userId в разных вариантах
      const userId = decoded.userId || decoded.user_id || decoded.id;
      // console.log('Extracted userId:', userId, 'type:', typeof userId);
      
      if (!userId) {
        console.error('NO USER ID IN TOKEN! Token payload:', decoded);
        return res.status(401).json({
          success: false,
          error: 'Token does not contain user ID'
        });
      }
      
      // 5. Преобразуем в число
      const numericUserId = Number(userId);
      // console.log('Numeric userId:', numericUserId);
      
      // 6. Устанавливаем разными способами
      (req as any).userId = numericUserId;
      // console.log('Set (req as any).userId:', (req as any).userId);
      
      // Пробуем через расширение типа
      req.userId = numericUserId;
      // console.log('Set req.userId (typed):', req.userId);
      
      // 7. Проверяем что установилось
      // console.log('Final check - req.userId:', req.userId);
      // console.log('Final check - (req as any).userId:', (req as any).userId);
      
      next();
    } catch (verifyError: any) {
      console.error('JWT verify error:', verifyError.message);
      console.error('Error name:', verifyError.name);
      
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
    console.error('Auth middleware general error:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};