"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../../modules/auth/controllers/AuthController");
const hcaptcha_middleware_1 = require("../../shared/middleware/hcaptcha.middleware");
const router = (0, express_1.Router)();
router.post('/register', hcaptcha_middleware_1.hcaptchaMiddleware.verify, AuthController_1.authController.register);
router.post('/login', hcaptcha_middleware_1.hcaptchaMiddleware.verify, AuthController_1.authController.login);
router.post('/recover', hcaptcha_middleware_1.hcaptchaMiddleware.verify, AuthController_1.authController.recover);
// не требуют hCaptcha
router.get('/verify', AuthController_1.authController.verify);
router.post('/check-password-strength', AuthController_1.authController.checkPasswordStrength);
router.get('/generate-password', AuthController_1.authController.generatePasswordRecommendation);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map