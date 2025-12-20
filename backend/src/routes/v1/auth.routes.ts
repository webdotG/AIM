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

// POST /api/v1/auth/register
router.post(
  '/register', 
  // authLimiter,
  validate(registerSchema), 
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login', 
  // authLimiter,
  validate(loginSchema), 
  authController.login
);

// POST /api/v1/auth/recover
router.post(
  '/recover', 
  // authLimiter,
  validate(recoverSchema), 
  authController.recover
);

export default router;