"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionsRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EmotionsRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findAll() {
        const result = await this.pool.query('SELECT id, code, name_ru, name_en, category FROM emotions ORDER BY category, name_en');
        return result.rows;
    }
    async findByCategory(category) {
        const result = await this.pool.query('SELECT id, code, name_ru, name_en, category FROM emotions WHERE category = $1 ORDER BY name_en', [category]);
        return result.rows;
    }
    async findById(id) {
        const result = await this.pool.query('SELECT id, code, name_ru, name_en, category FROM emotions WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
}
exports.EmotionsRepository = EmotionsRepository;
//# sourceMappingURL=EmotionsRepository.js.map