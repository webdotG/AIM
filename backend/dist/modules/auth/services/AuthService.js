"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const PasswordHasher_1 = require("./PasswordHasher");
const JWTService_1 = require("./JWTService");
const query_1 = require("../../../db/query");
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    // В AuthService.ts обновим метод register:
    async register(input) {
        const { login, password } = input;
        // Профессиональная проверка пароля
        const strengthCheck = PasswordHasher_1.passwordHasher.checkStrength(password);
        if (!strengthCheck.isStrong) {
            const errorDetails = [
                `Password strength score: ${strengthCheck.score}/100`,
                ...strengthCheck.reasons.map(r => `• ${r}`),
                ...(strengthCheck.suggestions.length > 0 ?
                    ['Suggestions:', ...strengthCheck.suggestions.map(s => `• ${s}`)] : [])
            ].join('\n');
            throw new Error(`Password security requirements not met:\n${errorDetails}`);
        }
        // Проверка уникальности логина
        const exists = await this.userRepository.existsByLogin(login);
        if (exists) {
            throw new Error('Login already taken');
        }
        // Хеширование пароля
        const passwordHash = await PasswordHasher_1.passwordHasher.hash(password);
        // Генерация backup-кода
        const backupCode = PasswordHasher_1.passwordHasher.generateBackupCode();
        const backupCodeHash = await PasswordHasher_1.passwordHasher.hashBackupCode(backupCode);
        // Создание пользователя
        const user = await this.userRepository.create({
            login,
            password_hash: passwordHash,
            backup_code_hash: backupCodeHash,
        });
        // Генерация токена
        const token = JWTService_1.jwtService.sign({
            userId: user.id,
            login: user.login,
        });
        console.log(`User registered: ${user.login} (ID: ${user.id})`);
        return {
            user: {
                id: user.id,
                login: user.login,
            },
            token,
            backupCode,
        };
    }
    async login(input) {
        const { login, password } = input;
        const startTime = Date.now();
        try {
            const user = await this.userRepository.findByLogin(login);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            const isValid = await PasswordHasher_1.passwordHasher.verify(password, user.password_hash);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
            const token = JWTService_1.jwtService.sign({
                userId: user.id,
                login: user.login,
            });
            console.log(`User logged in: ${user.login} (ID: ${user.id})`);
            return {
                user: {
                    id: user.id,
                    login: user.login,
                },
                token,
            };
        }
        finally {
            const elapsed = Date.now() - startTime;
            if (elapsed < 500) {
                await this.delay(500 - elapsed);
            }
        }
    }
    async updatePassword(input) {
        const { backupCode, newPassword } = input;
        if (!backupCode || !newPassword) {
            throw new Error('Backup code and new password are required');
        }
        const users = await (0, query_1.query)('SELECT * FROM users WHERE backup_code_hash IS NOT NULL');
        let foundUser = null;
        for (const user of users) {
            if (user.backup_code_hash) {
                const isValid = await PasswordHasher_1.passwordHasher.verifyBackupCode(backupCode, user.backup_code_hash);
                if (isValid) {
                    foundUser = user;
                    break;
                }
            }
        }
        if (!foundUser) {
            throw new Error('Invalid backup code');
        }
        // Проверка силы нового пароля
        const strength = PasswordHasher_1.passwordHasher.checkStrength(newPassword);
        if (!strength.isStrong) {
            throw new Error('New password is too weak');
        }
        // Хеширование нового пароля
        const passwordHash = await PasswordHasher_1.passwordHasher.hash(newPassword);
        // Генерация нового backup-кода
        const newBackupCode = PasswordHasher_1.passwordHasher.generateBackupCode();
        const newBackupCodeHash = await PasswordHasher_1.passwordHasher.hashBackupCode(newBackupCode);
        // Обновление пользователя
        await this.userRepository.update(foundUser.id, {
            password_hash: passwordHash,
            backup_code_hash: newBackupCodeHash,
        });
        // Генерация нового токена
        const token = JWTService_1.jwtService.sign({
            userId: foundUser.id,
            login: foundUser.login,
        });
        console.log(`Password updated for user: ${foundUser.login} (ID: ${foundUser.id})`);
        return {
            user: {
                id: foundUser.id,
                login: foundUser.login,
            },
            token,
            backupCode: newBackupCode,
        };
    }
    async validateToken(token) {
        try {
            const payload = JWTService_1.jwtService.verify(token);
            const user = await this.userRepository.findById(payload.userId);
            if (!user) {
                return null;
            }
            return {
                id: user.id,
                login: user.login,
            };
        }
        catch (error) {
            return null;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map