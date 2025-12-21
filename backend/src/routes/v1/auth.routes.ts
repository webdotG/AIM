import { Router } from 'express';
import { authController } from '../../modules/auth/controllers/AuthController';
import { hcaptchaMiddleware } from '../../shared/middleware/hcaptcha.middleware';

const router = Router();

router.post('/register', hcaptchaMiddleware.verify, authController.register);
router.post('/login', hcaptchaMiddleware.verify, authController.login);
router.post('/recover', hcaptchaMiddleware.verify, authController.recover);

// Эти endpoints не требуют hCaptcha
router.get('/verify', authController.verify);
router.post('/check-password-strength', authController.checkPasswordStrength);
router.get('/generate-password', authController.generatePasswordRecommendation);

export default router;