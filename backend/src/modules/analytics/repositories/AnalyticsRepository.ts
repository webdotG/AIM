import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class AnalyticsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async getOverallStats(userId: number) {
    const result = await this.pool.query(
      `SELECT 
        nt.code AS node_type,
        COUNT(*) AS count
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY nt.code
       ORDER BY count DESC`,
      [userId]
    );

    return result.rows.reduce((acc: any, row: any) => {
      acc[row.node_type] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);
  }

  async getEntriesByMonth(userId: number, months: number = 12) {
    const result = await this.pool.query(
      `SELECT 
        date_trunc('month', n.created_at)::date AS month,
        nt.code AS node_type,
        COUNT(*) AS count
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE n.user_id = $1 
         AND n.deleted_at IS NULL
         AND n.created_at >= date_trunc('month', (NOW() - INTERVAL '${months} months'))
       GROUP BY month, nt.code
       ORDER BY month ASC, count DESC`,
      [userId]
    );

    return result.rows;
  }

  async getEmotionDistribution(userId: number) {
    const result = await this.pool.query(
      `SELECT 
        e.category AS emotion_category,
        COUNT(*) AS occurrence_count,
        ROUND(AVG(ne.intensity)::numeric, 2) AS avg_intensity,
        ROUND(AVG(ne.intensity)::numeric) AS avg_intensity_rounded
       FROM node_emotions ne
       JOIN nodes n ON n.id = ne.node_id
       JOIN emotions e ON e.id = ne.emotion_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY e.category
       ORDER BY occurrence_count DESC`,
      [userId]
    );

    return result.rows;
  }

  async getActivityHeatmap(userId: number, year: number) {
    const result = await this.pool.query(
      `SELECT 
        n.created_at::date AS day,
        COUNT(*) AS count
       FROM nodes n
       WHERE n.user_id = $1 
         AND n.deleted_at IS NULL
         AND EXTRACT(YEAR FROM n.created_at) = $2
       GROUP BY day
       ORDER BY day ASC`,
      [userId, year]
    );

    return result.rows;
  }

  async getStreaks(userId: number) {
    const result = await this.pool.query(
      `WITH daily_entries AS (
        SELECT DISTINCT created_at::date AS entry_date
        FROM nodes n
        WHERE n.user_id = $1 AND n.deleted_at IS NULL
      ),
      gaps AS (
        SELECT 
          entry_date,
          entry_date - LAG(entry_date) OVER (ORDER BY entry_date) AS gap
        FROM daily_entries
      ),
      streaks AS (
        SELECT 
          entry_date,
          CASE WHEN gap > 1 THEN 1 ELSE 0 END AS new_streak
        FROM gaps
      )
      SELECT 
        MAX(entry_date) AS last_date,
        COUNT(*) AS current_streak
      FROM (
        SELECT entry_date, 
               SUM(new_streak) OVER (ORDER BY entry_date DESC) AS streak_group
        FROM streaks
      ) sub
      WHERE streak_group = (SELECT MIN(streak_group) 
                           FROM (SELECT SUM(new_streak) OVER (ORDER BY entry_date DESC) AS streak_group FROM streaks) sub2)
      GROUP BY streak_group
      LIMIT 1`,
      [userId]
    );

    const lastEntry = await this.pool.query(
      'SELECT MAX(created_at)::date AS last_date FROM nodes WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    const streak = result.rows[0];
    const isCurrent = lastEntry.rows[0].last_date === (streak?.last_date || null) || 
                      lastEntry.rows[0].last_date === (streak?.last_date || new Date()).toISOString().split('T')[0];

    return {
      current_streak: streak ? parseInt(streak.current_streak) : 0,
      is_current: isCurrent,
    };
  }

  async getEmotionTimeline(userId: number, granularity: 'day' | 'week' | 'month' = 'day') {
    let timePart = '';
    if (granularity === 'day') {
      timePart = 'n.created_at::date';
    } else if (granularity === 'week') {
      timePart = 'date_trunc(\'week\', n.created_at)::date';
    } else {
      timePart = 'date_trunc(\'month\', n.created_at)::date';
    }

    const result = await this.pool.query(
      `SELECT 
        ${timePart} AS period,
        e.category AS emotion_category,
        COUNT(*)::int AS count,
        ROUND(AVG(ne.intensity)::numeric, 2)::float AS avg_intensity,
        ROUND(AVG(ne.intensity)::numeric)::int AS avg_intensity_rounded
       FROM node_emotions ne
       JOIN nodes n ON n.id = ne.node_id
       JOIN emotions e ON e.id = ne.emotion_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY period, e.category
       ORDER BY period DESC
       LIMIT 100`,
      [userId]
    );

    return result.rows;
  }

  async getNodeConnections(userId: number) {
    const result = await this.pool.query(
      `SELECT 
        n.id,
        n.title,
        nt.code AS node_type_code,
        COUNT(e.id) AS connection_count,
        array_agg(DISTINCT et.code) AS edge_types,
        (SELECT COUNT(*) FROM edges e2 
         JOIN nodes n2 ON n2.id = (CASE WHEN e2.from_node_id = n.id THEN e2.to_node_id ELSE e2.from_node_id END)
         JOIN people p ON p.node_id = (CASE WHEN e2.from_node_id = n.id THEN e2.to_node_id ELSE e2.from_node_id END)
         WHERE n2.user_id = $1 AND p.deleted_at IS NULL) AS people_contact_count
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       LEFT JOIN edges e ON (e.from_node_id = n.id OR e.to_node_id = n.id)
         AND e.deleted_at IS NULL
       LEFT JOIN edge_types et ON et.id = e.edge_type_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY n.id, n.title, nt.code
       HAVING COUNT(e.id) > 0
       ORDER BY connection_count DESC
       LIMIT 50`,
      [userId]
    );

    return result.rows;
  }

  async getUserProfile(userId: number) {
    const stats = await this.getOverallStats(userId);
    const emotions = await this.getEmotionDistribution(userId);
    const streaks = await this.getStreaks(userId);

    return {
      node_stats: stats,
      emotion_distribution: emotions,
      streaks,
      total_nodes: Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number,
    };
  }
}