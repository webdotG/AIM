"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const UserRepository_1 = require("../repositories/UserRepository");
const auth_schema_1 = require("../validation/auth.schema");
const logger_1 = __importDefault(require("../../../shared/utils/logger"));
class AuthController {
    constructor() {
        /**
         * Регистрация
         */
        this.register = async (req, res) => {
            try {
                // Валидация входных данных
                const input = auth_schema_1.registerSchema.parse(req.body);
                // Регистрация
                const result = await this.authService.register(input);
                // Успешный ответ
                res.status(201).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                        backupCode: result.backupCode,
                        message: '⚠️ SAVE THIS BACKUP CODE! You will need it to recover your password.',
                    },
                });
            }
            catch (error) {
                logger_1.default.error('Registration error:', error);
                if (error.name === 'ZodError') {
                    res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: error.errors,
                    });
                    return;
                }
                res.status(400).json({
                    success: false,
                    error: error.message || 'Registration failed',
                });
            }
        };
        /**
         * Вход
         */
        this.login = async (req, res) => {
            try {
                // Валидация входных данных
                const input = auth_schema_1.loginSchema.parse(req.body);
                // Аутентификация
                const result = await this.authService.login(input);
                // Успешный ответ
                res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                    },
                });
            }
            catch (error) {
                logger_1.default.error('Login error:', error);
                if (error.name === 'ZodError') {
                    res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: error.errors,
                    });
                    return;
                }
                res.status(401).json({
                    success: false,
                    error: error.message || 'Invalid credentials',
                });
            }
        };
        /**
         * Смена пароля через backup-код
         */
        this.updatePassword = async (req, res) => {
            try {
                // Валидация входных данных
                const input = auth_schema_1.updatePasswordSchema.parse(req.body);
                // Смена пароля
                const result = await this.authService.updatePassword(input);
                // Успешный ответ
                res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        token: result.token,
                        backupCode: result.backupCode,
                        message: 'Password updated successfully. Save your new backup code!',
                    },
                });
            }
            catch (error) {
                logger_1.default.error('Update password error:', error);
                if (error.name === 'ZodError') {
                    res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: error.errors,
                    });
                    return;
                }
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to update password',
                });
            }
        };
        /**
         * Проверка токена
         */
        this.verify = async (req, res) => {
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
            }
            catch (error) {
                logger_1.default.error('Token verification error:', error);
                res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                });
            }
        };
        this.recover = async (req, res, next) => {
            try {
                const { backup_code, new_password } = req.body; // Убираем login
                // Используем существующий метод updatePassword
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
            }
            catch (error) {
                logger_1.default.error('Password recovery error:', error);
                if (error.name === 'ZodError') {
                    res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: error.errors,
                    });
                    return;
                }
                res.status(400).json({
                    success: false,
                    error: error.message || 'Failed to recover password',
                });
            }
        };
        const userRepository = new UserRepository_1.UserRepository();
        this.authService = new AuthService_1.AuthService(userRepository);
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
