import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { 
  registerSchema, 
  loginSchema, 
  updatePasswordSchema,
  RegisterInput,
  LoginInput,
  UpdatePasswordInput,
} from '../validation/auth.schema';
import logger from '../../../shared/utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    const userRepository = new UserRepository();
    this.authService = new AuthService(userRepository);
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {

      const input: RegisterInput = registerSchema.parse(req.body);

      const result = await this.authService.register(input);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          backupCode: result.backupCode,
          message: 'SAVE THIS BACKUP CODE! You will need it to recover your password.',
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {

      const input: LoginInput = loginSchema.parse(req.body);

      const result = await this.authService.login(input);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: error.message || 'Invalid credentials',
      });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: UpdatePasswordInput = updatePasswordSchema.parse(req.body);

      const result = await this.authService.updatePassword(input);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          backupCode: result.backupCode,
          message: 'Password updated successfully. Save your new backup code!',
        },
      });
    } catch (error: any) {
      logger.error('Update password error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update password',
      });
    }
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: 'No token provided',
        });
        return;
      }

      const user = await this.authService.validateToken(token);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            login: user.login,
          },
        },
      });
    } catch (error: any) {
      logger.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
  };


  recover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { backup_code, new_password } = req.body; 
      
      const result = await this.authService.updatePassword({
        backupCode: backup_code,
        newPassword: new_password
      });
      
      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          backup_code: result.backupCode,
          message: 'Password updated successfully',
        },
      });
    } catch (error: any) {
      logger.error('Password recovery error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to recover password',
      });
    }
  };

}

export const authController = new (AuthController as any)();