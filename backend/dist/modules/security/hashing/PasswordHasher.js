"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHasher = exports.PasswordHasher = void 0;
// src/modules/security/hashing/PasswordHasher.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("@/shared/config"));
class PasswordHasher {
    pepper;
    bcryptRounds;
    constructor() {
        this.pepper = config_1.default.PASSWORD_PEPPER;
        this.bcryptRounds = config_1.default.BCRYPT_ROUNDS;
    }
    /**
     * Слой 1: Применяем pepper через HMAC-SHA256
     */
    applyPepper(password) {
        const hmac = crypto_1.default.createHmac('sha256', this.pepper);
        hmac.update(password);
        return hmac.digest('hex');
    }
    /**
     * Хеширование пароля: Pepper → Bcrypt
     */
    async hash(password) {
        const peppered = this.applyPepper(password);
        const hash = await bcrypt_1.default.hash(peppered, this.bcryptRounds);
        return hash;
    }
    /**
     * Проверка пароля
     */
    async verify(password, hash) {
        const peppered = this.applyPepper(password);
        return bcrypt_1.default.compare(peppered, hash);
    }
    /**
     * Проверка силы пароля
     */
    checkStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const score = [
            password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecial,
        ].filter(Boolean).length;
        return {
            score,
            isStrong: score >= 4,
            feedback: {
                length: password.length >= minLength,
                uppercase: hasUpperCase,
                lowercase: hasLowerCase,
                numbers: hasNumbers,
                special: hasSpecial,
            },
        };
    }
    /**
     * Генерация backup-кода
     */
    generateBackupCode() {
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без O, 0, I, 1
        let code = '';
        for (let i = 0; i < 12; i++) {
            const randomIndex = crypto_1.default.randomInt(0, charset.length);
            code += charset[randomIndex];
            if ((i + 1) % 4 === 0 && i < 11) {
                code += '-';
            }
        }
        return code; // "ABCD-1234-EFGH"
    }
    /**
     * Хеширование backup-кода
     */
    async hashBackupCode(code) {
        const normalized = code.replace(/-/g, '');
        return bcrypt_1.default.hash(normalized, this.bcryptRounds);
    }
    /**
     * Проверка backup-кода
     */
    async verifyBackupCode(code, hash) {
        const normalized = code.replace(/-/g, '');
        return bcrypt_1.default.compare(normalized, hash);
    }
}
exports.PasswordHasher = PasswordHasher;
exports.passwordHasher = new PasswordHasher();
