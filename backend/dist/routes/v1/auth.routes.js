"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../../modules/auth/controllers/AuthController");
// import { authLimiter } from '../../modules/security/middleware/rateLimiter';
const router = (0, express_1.Router)();
router.post('/register', AuthController_1.authController.register);
router.post('/login', AuthController_1.authController.login);
router.post('/recover', AuthController_1.authController.recover);
router.get('/verify', AuthController_1.authController.verify);
// НОВЫЕ ROUTES для проверки пароля
router.post('/check-password-strength', AuthController_1.authController.checkPasswordStrength);
router.get('/generate-password', AuthController_1.authController.generatePasswordRecommendation);
exports.default = router;
