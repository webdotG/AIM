"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../../modules/auth/controllers/AuthController");
const validator_middleware_1 = require("../../shared/middleware/validator.middleware");
const auth_schema_1 = require("../../modules/auth/schemas/auth.schema");
const rateLimiter_1 = require("../../modules/security/middleware/rateLimiter");
const router = (0, express_1.Router)();
// POST /api/v1/auth/register
router.post('/register', rateLimiter_1.authLimiter, (0, validator_middleware_1.validate)(auth_schema_1.registerSchema), AuthController_1.authController.register);
// POST /api/v1/auth/login
router.post('/login', rateLimiter_1.authLimiter, (0, validator_middleware_1.validate)(auth_schema_1.loginSchema), AuthController_1.authController.login);
// POST /api/v1/auth/recover
router.post('/recover', rateLimiter_1.authLimiter, (0, validator_middleware_1.validate)(auth_schema_1.recoverSchema), AuthController_1.authController.recover);
exports.default = router;
