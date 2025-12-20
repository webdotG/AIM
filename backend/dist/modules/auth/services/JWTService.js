"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class JWTService {
    sign(payload) {
        if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
            throw new Error('JWT_SECRET is not properly configured. Set JWT_SECRET environment variable.');
        }
        // Преобразуем expiresIn в число если это строка с числами
        let expiresIn = JWT_EXPIRES_IN;
        if (/^\d+$/.test(JWT_EXPIRES_IN)) {
            expiresIn = parseInt(JWT_EXPIRES_IN, 10);
        }
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: expiresIn
        });
    }
    verify(token) {
        if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
            throw new Error('JWT_SECRET is not properly configured');
        }
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
}
exports.JWTService = JWTService;
exports.jwtService = new JWTService();
