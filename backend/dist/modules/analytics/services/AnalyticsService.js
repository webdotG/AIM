"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    constructor(pool) {
        this.pool = pool;
    }
    async getOverallStats(userId) {
        const result = await this.pool.query(`SELECT 
        COUNT(*) FILTER (WHERE entry_type = 'dream') as dreams,
        COUNT(*) FILTER (WHERE entry_type = 'memory') as memories,
        COUNT(*) FILTER (WHERE entry_type = 'thought') as thoughts,
        COUNT(*) FILTER (WHERE entry_type = 'plan') as plans,
        COUNT(*) FILTER (WHERE entry_type = 'plan' AND is_completed = true) as completed_plans,
        COUNT(*) FILTER (WHERE entry_type = 'plan' AND is_completed = false AND deadline < NOW()) as overdue_plans,
        COUNT(*) as total_entries
       FROM entries WHERE user_id = $1`, [userId]);
        return result.rows[0];
    }
    async getEntriesByMonth(userId, months = 12) {
        const result = await this.pool.query(`SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        entry_type,
        COUNT(*) as count
       FROM entries 
       WHERE user_id = $1 
         AND created_at >= NOW() - INTERVAL '${months} months'
       GROUP BY month, entry_type
       ORDER BY month DESC`, [userId]);
        return result.rows;
    }
    async getEmotionDistribution(userId, fromDate, toDate) {
        let query = `
      SELECT 
        COALESCE(e.category, ee.emotion_category) as category,
        COUNT(*) as count,
        AVG(ee.intensity) as avg_intensity
      FROM entry_emotions ee
      JOIN entries ent ON ee.entry_id = ent.id
      LEFT JOIN emotions e ON ee.emotion_id = e.id
      WHERE ent.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (fromDate) {
            query += ` AND ent.created_at >= $${paramIndex}`;
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            query += ` AND ent.created_at <= $${paramIndex}`;
            params.push(toDate);
        }
        query += ` GROUP BY category`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async getActivityHeatmap(userId, year) {
        const result = await this.pool.query(`SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*) as count
       FROM entries 
       WHERE user_id = $1 
         AND EXTRACT(YEAR FROM created_at) = $2
       GROUP BY date
       ORDER BY date ASC`, [userId, year]);
        return result.rows;
    }
    async getStreaks(userId) {
        // Подсчитываем текущую серию дней подряд
        const result = await this.pool.query(`WITH daily_entries AS (
        SELECT DISTINCT DATE(created_at) as entry_date
        FROM entries
        WHERE user_id = $1
        ORDER BY entry_date DESC
      ),
      streaks AS (
        SELECT 
          entry_date,
          entry_date - ROW_NUMBER() OVER (ORDER BY entry_date)::int as streak_group
        FROM daily_entries
      )
      SELECT 
        COUNT(*) as current_streak
      FROM streaks
      WHERE streak_group = (
        SELECT streak_group 
        FROM streaks 
        WHERE entry_date = (SELECT MAX(entry_date) FROM daily_entries)
      )`, [userId]);
        return { current_streak: parseInt(result.rows[0]?.current_streak || 0) };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=AnalyticsService.js.map