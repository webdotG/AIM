"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const query_1 = require("../../../db/query");
class UserRepository {
    async existsByLogin(login) {
        const result = await (0, query_1.queryOne)('SELECT EXISTS(SELECT 1 FROM users WHERE login = $1)', [login]);
        return result?.exists || false;
    }
    async findByLogin(login) {
        return (0, query_1.queryOne)('SELECT * FROM users WHERE login = $1', [login]);
    }
    async findById(id) {
        return (0, query_1.queryOne)('SELECT * FROM users WHERE id = $1', [id]);
    }
    async create(data) {
        const result = await (0, query_1.query)('INSERT INTO users (login, password_hash, backup_code_hash) VALUES ($1, $2, $3) RETURNING *', [data.login, data.password_hash, data.backup_code_hash]);
        return result[0];
    }
    async update(id, data) {
        await (0, query_1.query)('UPDATE users SET password_hash = $1, backup_code_hash = $2 WHERE id = $3', [data.password_hash, data.backup_code_hash, id]);
    }
    async findAll() {
        try {
            const result = await (0, query_1.query)('SELECT * FROM users');
            return result;
        }
        catch (error) {
            console.error('Error in findAll:', error);
            return [];
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map