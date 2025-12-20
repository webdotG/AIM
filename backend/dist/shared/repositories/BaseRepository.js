"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async query(text, params) {
        return this.pool.query(text, params);
    }
}
exports.BaseRepository = BaseRepository;
