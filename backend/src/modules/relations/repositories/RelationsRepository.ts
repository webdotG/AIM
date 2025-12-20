import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

interface RelationData {
  from_entry_id: string;
  to_entry_id: string;
  relation_type: string;
  description?: string | null;
}

export class RelationsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super('entry_relations', pool);
  }

  async findById(id: number) {
    const result = await this.pool.query(
      `SELECT * FROM entry_relations WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Получить все связи для записи (входящие и исходящие)
  async getForEntry(entryId: string) {
    const result = await this.pool.query(
      `SELECT 
        er.*,
        e_from.content as from_content,
        e_from.entry_type as from_type,
        e_from.created_at as from_created_at,
        e_to.content as to_content,
        e_to.entry_type as to_type,
        e_to.created_at as to_created_at
      FROM entry_relations er
      LEFT JOIN entries e_from ON er.from_entry_id = e_from.id
      LEFT JOIN entries e_to ON er.to_entry_id = e_to.id
      WHERE er.from_entry_id = $1 OR er.to_entry_id = $1
      ORDER BY er.created_at DESC`,
      [entryId]
    );

    // Разделяем на входящие и исходящие
    const incoming = result.rows.filter(r => r.to_entry_id === entryId);
    const outgoing = result.rows.filter(r => r.from_entry_id === entryId);

    return { incoming, outgoing };
  }

  // Создать связь
  async create(data: RelationData) {
    const result = await this.pool.query(
      `INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.from_entry_id, data.to_entry_id, data.relation_type, data.description || null]
    );
    return result.rows[0];
  }

  // Удалить связь
  async delete(id: number) {
    const result = await this.pool.query(
      `DELETE FROM entry_relations WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  }

  // Получить цепочку связей (граф) - рекурсивный CTE
  async getChain(entryId: string, maxDepth: number = 10, direction: 'forward' | 'backward' | 'both' = 'both') {
    let query = '';

    if (direction === 'forward' || direction === 'both') {
      // Идём вперёд по графу (from -> to)
      query = `
        WITH RECURSIVE relation_chain AS (
          -- Начальная запись
          SELECT 
            id,
            entry_type,
            content,
            created_at,
            0 as depth,
            CAST(NULL AS VARCHAR) as relation_type,
            ARRAY[id::TEXT] as path
          FROM entries
          WHERE id = $1

          UNION ALL

          -- Рекурсивная часть
          SELECT 
            e.id,
            e.entry_type,
            e.content,
            e.created_at,
            rc.depth + 1,
            er.relation_type,
            rc.path || e.id::TEXT
          FROM relation_chain rc
          JOIN entry_relations er ON rc.id = er.from_entry_id
          JOIN entries e ON er.to_entry_id = e.id
          WHERE rc.depth < $2
            AND NOT (e.id::TEXT = ANY(rc.path))  -- Избегаем циклов
        )
        SELECT * FROM relation_chain ORDER BY depth ASC
      `;
    } else {
      // Идём назад (to -> from)
      query = `
        WITH RECURSIVE relation_chain AS (
          SELECT 
            id,
            entry_type,
            content,
            created_at,
            0 as depth,
            CAST(NULL AS VARCHAR) as relation_type,
            ARRAY[id::TEXT] as path
          FROM entries
          WHERE id = $1

          UNION ALL

          SELECT 
            e.id,
            e.entry_type,
            e.content,
            e.created_at,
            rc.depth + 1,
            er.relation_type,
            rc.path || e.id::TEXT
          FROM relation_chain rc
          JOIN entry_relations er ON rc.id = er.to_entry_id
          JOIN entries e ON er.from_entry_id = e.id
          WHERE rc.depth < $2
            AND NOT (e.id::TEXT = ANY(rc.path))
        )
        SELECT * FROM relation_chain ORDER BY depth ASC
      `;
    }

    const result = await this.pool.query(query, [entryId, maxDepth]);
    return result.rows;
  }

  // Проверка на циклы (есть ли путь от A к B)
  async hasCycle(fromId: string, toId: string): Promise<boolean> {
    const result = await this.pool.query(
      `WITH RECURSIVE path AS (
        SELECT to_entry_id as current_id, 1 as depth
        FROM entry_relations
        WHERE from_entry_id = $1

        UNION ALL

        SELECT er.to_entry_id, p.depth + 1
        FROM path p
        JOIN entry_relations er ON p.current_id = er.from_entry_id
        WHERE p.depth < 20  -- Лимит глубины
      )
      SELECT EXISTS(SELECT 1 FROM path WHERE current_id = $2) as has_cycle`,
      [toId, fromId]
    );
    return result.rows[0].has_cycle;
  }

  // Получить все типы связей
  async getRelationTypes() {
    // В нашей БД типы хардкодятся в CHECK constraint
    // Возвращаем их как справочник
    return [
      { name: 'led_to', description: 'Привело к', direction: 'forward' },
      { name: 'reminded_of', description: 'Напомнило о', direction: 'backward' },
      { name: 'inspired_by', description: 'Вдохновлено', direction: 'backward' },
      { name: 'caused_by', description: 'Вызвано', direction: 'backward' },
      { name: 'related_to', description: 'Связано с', direction: 'both' },
      { name: 'resulted_in', description: 'Привело к результату', direction: 'forward' }
    ];
  }

  // Статистика: самые связанные записи
  async getMostConnected(userId: number, limit: number = 10) {
    const result = await this.pool.query(
      `SELECT 
        e.id,
        e.entry_type,
        e.content,
        e.created_at,
        COUNT(DISTINCT er1.id) as outgoing_count,
        COUNT(DISTINCT er2.id) as incoming_count,
        COUNT(DISTINCT er1.id) + COUNT(DISTINCT er2.id) as total_connections
      FROM entries e
      LEFT JOIN entry_relations er1 ON e.id = er1.from_entry_id
      LEFT JOIN entry_relations er2 ON e.id = er2.to_entry_id
      WHERE e.user_id = $1
      GROUP BY e.id, e.entry_type, e.content, e.created_at
      HAVING COUNT(DISTINCT er1.id) + COUNT(DISTINCT er2.id) > 0
      ORDER BY total_connections DESC
      LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // Граф для визуализации (узлы + рёбра)
  async getGraphData(userId: number, entryId?: string) {
    let query = `
      SELECT 
        er.id as edge_id,
        er.from_entry_id,
        er.to_entry_id,
        er.relation_type,
        er.description,
        e_from.content as from_content,
        e_from.entry_type as from_type,
        e_to.content as to_content,
        e_to.entry_type as to_type
      FROM entry_relations er
      JOIN entries e_from ON er.from_entry_id = e_from.id
      JOIN entries e_to ON er.to_entry_id = e_to.id
      WHERE e_from.user_id = $1
    `;

    const params: any[] = [userId];

    if (entryId) {
      query += ` AND (er.from_entry_id = $2 OR er.to_entry_id = $2)`;
      params.push(entryId);
    }

    const result = await this.pool.query(query, params);

    // Формируем nodes и edges
    const nodesMap = new Map();
    const edges = [];

    for (const row of result.rows) {
      // Добавляем узлы
      if (!nodesMap.has(row.from_entry_id)) {
        nodesMap.set(row.from_entry_id, {
          id: row.from_entry_id,
          content: row.from_content,
          type: row.from_type
        });
      }
      if (!nodesMap.has(row.to_entry_id)) {
        nodesMap.set(row.to_entry_id, {
          id: row.to_entry_id,
          content: row.to_content,
          type: row.to_type
        });
      }

      // Добавляем рёбра
      edges.push({
        id: row.edge_id,
        from: row.from_entry_id,
        to: row.to_entry_id,
        relation_type: row.relation_type,
        description: row.description
      });
    }

    return {
      nodes: Array.from(nodesMap.values()),
      edges
    };
  }
}