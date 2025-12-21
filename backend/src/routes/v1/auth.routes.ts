import { Router } from 'express';
import { authController } from '../../modules/auth/controllers/AuthController';
import { validate } from '../../shared/middleware/validator.middleware';
import { 
  registerSchema, 
  loginSchema, 
  recoverSchema 
} from '../../modules/auth/schemas/auth.schema';
// import { authLimiter } from '../../modules/security/middleware/rateLimiter';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/recover', authController.recover);
router.get('/verify', authController.verify);

// НОВЫЕ ROUTES для проверки пароля
router.post('/check-password-strength', authController.checkPasswordStrength);
router.get('/generate-password', authController.generatePasswordRecommendation);

export default router;