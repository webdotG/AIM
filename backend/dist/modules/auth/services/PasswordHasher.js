"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHasher = exports.PasswordHasher = void 0;
// modules/auth/services/PasswordHasher.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const crypto_2 = require("crypto");
class PasswordHasher {
    constructor() {
        this.minPasswordLength = 12;
        this.maxPasswordLength = 128; // Защита от DoS
        this.requiredPatterns = {
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            digit: /\d/,
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            noSpaces: /^\S*$/,
            noCommon: /^(?!(?:password|123456|admin|qwerty|letmein|welcome|monkey|dragon|master|sunshine)\b)/i
        };
        this.pepper = process.env.PASSWORD_PEPPER || '';
        this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        if (!this.pepper || this.pepper.length < 32) {
            throw new Error('PASSWORD_PEPPER must be set and at least 32 characters');
        }
        if (this.saltRounds < 10 || this.saltRounds > 15) {
            throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
        }
    }
    async hash(password) {
        this.validatePasswordLength(password);
        // HMAC для защиты от length extension attacks
        const pepperedPassword = await this.applyPepper(password);
        return await bcrypt_1.default.hash(pepperedPassword, this.saltRounds);
    }
    async verify(password, hash) {
        try {
            this.validatePasswordLength(password);
            const pepperedPassword = await this.applyPepper(password);
            return await bcrypt_1.default.compare(pepperedPassword, hash);
        }
        catch (error) {
            // при ошибке constant-time
            return false;
        }
    }
    generateBackupCode() {
        // 16 байт = 128 бит энтропии
        // В hex формате = 32 символа 
        return crypto_1.default.randomBytes(16).toString('hex').toUpperCase();
    }
    async hashBackupCode(backupCode) {
        return await bcrypt_1.default.hash(backupCode, this.saltRounds);
    }
    async verifyBackupCode(backupCode, hash) {
        try {
            return await bcrypt_1.default.compare(backupCode.toUpperCase(), hash);
        }
        catch (error) {
            return false;
        }
    }
    checkStrength(password) {
        const reasons = [];
        const suggestions = [];
        let score = 0;
        // от DoS через очень длинные пароли
        if (password.length > this.maxPasswordLength) {
            reasons.push(`Password must be less than ${this.maxPasswordLength} characters`);
            return { isStrong: false, score: 0, reasons, suggestions };
        }
        // 1. Длина пароля
        if (password.length >= this.minPasswordLength) {
            score += Math.min(40, password.length * 2);
        }
        else {
            reasons.push(`Password must be at least ${this.minPasswordLength} characters`);
        }
        // 2. Разнообразие символов
        let charTypeBonus = 0;
        if (this.requiredPatterns.uppercase.test(password)) {
            score += 15;
            charTypeBonus += 1;
        }
        else {
            reasons.push('Password must contain at least one uppercase letter (A-Z)');
        }
        if (this.requiredPatterns.lowercase.test(password)) {
            score += 15;
            charTypeBonus += 1;
        }
        else {
            reasons.push('Password must contain at least one lowercase letter (a-z)');
        }
        if (this.requiredPatterns.digit.test(password)) {
            score += 15;
            charTypeBonus += 1;
        }
        else {
            reasons.push('Password must contain at least one number (0-9)');
        }
        if (this.requiredPatterns.special.test(password)) {
            score += 15;
            charTypeBonus += 1;
        }
        else {
            suggestions.push('Consider adding special characters (!@#$%^&* etc.)');
        }
        if (charTypeBonus >= 4) {
            score += 20;
        }
        // 3. Проверка на пробелы
        if (!this.requiredPatterns.noSpaces.test(password)) {
            reasons.push('Password cannot contain spaces');
            score -= 10;
        }
        // 4. Проверка на common passwords
        if (!this.requiredPatterns.noCommon.test(password)) {
            reasons.push('Password is too common or predictable');
            score = 0;
        }
        // 5. Проверка на последовательности (улучшенная)
        if (this.hasWeakPatterns(password)) {
            reasons.push('Password contains predictable patterns');
            score -= 20;
        }
        // 6. Проверка на повторяющиеся символы
        if (this.hasRepeatingChars(password)) {
            reasons.push('Password has too many repeating characters');
            score -= 15;
        }
        // 7. Проверка zxcvbn entropy (упрощённая)
        const entropyScore = this.estimateEntropy(password);
        if (entropyScore < 50) {
            reasons.push('Password is too predictable');
            score -= 15;
        }
        if (score < 70) {
            suggestions.push('Try using a passphrase: 3-4 random words with numbers/symbols');
            suggestions.push('Example: Purple-Monkey-87-Staple!');
        }
        return {
            isStrong: score >= 70 && reasons.length === 0,
            score: Math.max(0, Math.min(100, score)),
            reasons,
            suggestions
        };
    }
    // Проверка на слабые паттерны (расширенная)
    hasWeakPatterns(str) {
        const lowerStr = str.toLowerCase();
        // Прямые последовательности
        const forwardPatterns = [
            '123456', '234567', '345678', '456789',
            'abcdef', 'bcdefg', 'cdefgh', 'defghi',
            'qwerty', 'wertyu', 'ertyui', 'rtyuio',
            'asdfgh', 'sdfghj', 'dfghjk'
        ];
        // Обратные последовательности
        const reversePatterns = [
            '987654', '876543', '765432', '654321',
            'fedcba', 'edcbaz', 'dcbazy'
        ];
        // Клавиатурные паттерны
        const keyboardPatterns = [
            '!@#$%^', '^&*()', '()_+{}', '[]\\;\'',
            'zxcvbn', 'vbnm,.'
        ];
        const allPatterns = [...forwardPatterns, ...reversePatterns, ...keyboardPatterns];
        return allPatterns.some(pattern => lowerStr.includes(pattern));
    }
    // Проверка на повторяющиеся символы
    hasRepeatingChars(str) {
        // Проверяем на 4+ одинаковых символа подряд
        if (/(.)\1{3,}/.test(str))
            return true;
        // Проверяем на повторяющиеся пары (abab, 1212)
        if (/(.{2})\1{2,}/.test(str))
            return true;
        return false;
    }
    // Упрощённая оценка энтропии
    estimateEntropy(password) {
        let poolSize = 0;
        if (/[a-z]/.test(password))
            poolSize += 26;
        if (/[A-Z]/.test(password))
            poolSize += 26;
        if (/\d/.test(password))
            poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password))
            poolSize += 32;
        // Entropy = log2(poolSize^length)
        const entropy = Math.log2(Math.pow(poolSize, password.length));
        // Штраф за повторяющиеся символы
        const uniqueChars = new Set(password).size;
        const repetitionPenalty = uniqueChars / password.length;
        return entropy * repetitionPenalty;
    }
    //  Безопасное применение pepper через HMAC
    async applyPepper(password) {
        const encoder = new TextEncoder();
        const key = await crypto_2.subtle.importKey('raw', encoder.encode(this.pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto_2.subtle.sign('HMAC', key, encoder.encode(password));
        // Возвращаем base64 от HMAC
        return Buffer.from(signature).toString('base64');
    }
    // Валидация длины пароля
    validatePasswordLength(password) {
        if (password.length < this.minPasswordLength) {
            throw new Error(`Password must be at least ${this.minPasswordLength} characters`);
        }
        if (password.length > this.maxPasswordLength) {
            throw new Error(`Password must be less than ${this.maxPasswordLength} characters`);
        }
    }
    // генерация рекомендаций
    generatePasswordRecommendation() {
        const words = [
            'Master', 'Horse', 'Battery', 'Life',
            'Purple', 'Monkey', 'Sex', 'Elephant',
            'Love', 'AndThisOver', 'Penguin', 'Dragon',
            'Mountain', 'Ocean', 'Orgy', 'Crystal',
        ];
        // 4 случайных слова
        const selectedWords = [];
        const wordsCopy = [...words];
        for (let i = 0; i < 4; i++) {
            const randomIndex = crypto_1.default.randomInt(0, wordsCopy.length);
            selectedWords.push(wordsCopy[randomIndex]);
            wordsCopy.splice(randomIndex, 1);
        }
        // случайное число и символ
        const randomNumber = crypto_1.default.randomInt(10, 99);
        const symbols = '!@#$%^&*';
        const randomSymbol = symbols[crypto_1.default.randomInt(0, symbols.length)];
        return `${selectedWords.join('-')}-${randomNumber}${randomSymbol}`;
    }
}
exports.PasswordHasher = PasswordHasher;
exports.passwordHasher = new PasswordHasher();
//# sourceMappingURL=PasswordHasher.js.map