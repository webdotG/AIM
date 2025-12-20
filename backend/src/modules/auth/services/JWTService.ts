import jwt from 'jsonwebtoken';

// Интерфейс для полезной нагрузки
export interface JWTPayload {
  userId: number;
  login: string;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class JWTService {
  sign(payload: JWTPayload): string {
    if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET is not properly configured. Set JWT_SECRET environment variable.');
    }
    
    // Преобразуем expiresIn в число если это строка с числами
    let expiresIn: string | number = JWT_EXPIRES_IN;
    if (/^\d+$/.test(JWT_EXPIRES_IN)) {
      expiresIn = parseInt(JWT_EXPIRES_IN, 10);
    }
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: expiresIn as any 
    });
  }

  verify(token: string): JWTPayload {
    if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET is not properly configured');
    }
    
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }
}

export const jwtService = new JWTService();
