"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHasher = exports.PasswordHasher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../../shared/config"));
class PasswordHasher {
    constructor() {
        this.pepper = config_1.default.password.pepper;
        this.saltRounds = config_1.default.password.saltRounds;
    }
    async hash(password) {
        const pepperedPassword = password + this.pepper;
        return bcrypt_1.default.hash(pepperedPassword, this.saltRounds);
    }
    async verify(password, hash) {
        const pepperedPassword = password + this.pepper;
        return bcrypt_1.default.compare(pepperedPassword, hash);
    }
    generateBackupCode() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    async hashBackupCode(backupCode) {
        return bcrypt_1.default.hash(backupCode, this.saltRounds);
    }
    async verifyBackupCode(backupCode, hash) {
        return bcrypt_1.default.compare(backupCode, hash);
    }
    checkStrength(password) {
        const reasons = [];
        if (password.length < 8)
            reasons.push('Password must be at least 8 characters');
        if (!/[A-Z]/.test(password))
            reasons.push('Password must contain uppercase letter');
        if (!/[a-z]/.test(password))
            reasons.push('Password must contain lowercase letter');
        if (!/\d/.test(password))
            reasons.push('Password must contain number');
        return {
            isStrong: reasons.length === 0,
            reasons
        };
    }
}
exports.PasswordHasher = PasswordHasher;
exports.passwordHasher = new PasswordHasher();
