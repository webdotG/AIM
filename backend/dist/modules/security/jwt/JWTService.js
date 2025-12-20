"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = exports.JWTService = void 0;
// src/modules/security/jwt/JWTService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@/shared/config"));
class JWTService {
    secret;
    expiresIn = '7d';
    constructor() {
        this.secret = config_1.default.JWT_SECRET;
    }
    /**
     * Генерация токена
     */
    sign(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }
    /**
     * Верификация токена
     */
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secret);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    /**
     * Декодирование без верификации (для логов)
     */
    decode(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.JWTService = JWTService;
exports.jwtService = new JWTService();
