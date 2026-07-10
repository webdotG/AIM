import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class TraversalRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async traverse(
    startNodeId: string,
    userId: number,
    options: {
      direction?: 'forward' | 'backward' | 'both';
      depth?: number;
      filterNodeType?: string;
      filterEdgeType?: string;
      minConfidence?: number;
    } = {}
  ) {
    const direction = options.direction || 'both';
    const maxDepth = Math.min(options.depth || 10, 20);

    const visited = new Set<string>();
    visited.add(startNodeId);

    const path: any[] = [];
    const edges: any[] = [];

    // BFS queue: { nodeId, depth, parentNodeId }
    const queue: Array<{ nodeId: string; depth: number; parentNodeId?: string }> = [
      { nodeId: startNodeId, depth: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth >= maxDepth) continue;

      // Find neighbors based on direction
      let directionWhere = '';
      if (direction === 'forward') {
        directionWhere = "e.from_node_id = $1::uuid";
      } else if (direction === 'backward') {
        directionWhere = "e.to_node_id = $1::uuid";
} else {
        directionWhere = '(e.from_node_id = $1::uuid OR e.to_node_id = $1::uuid)';
      }

      let filterWhere = "e.deleted_at IS NULL";
      const params: any[] = [current.nodeId];
      let paramIndex = 2;

      if (options.filterEdgeType) {
        filterWhere += ` AND et.code = $${paramIndex}`;
        params.push(options.filterEdgeType);
        paramIndex++;
      }

      if (options.minConfidence !== undefined) {
        filterWhere += ` AND e.confidence >= $${paramIndex}`;
        params.push(options.minConfidence);
        paramIndex++;
      }

      // Determine neighbor node
      let neighborNodeExpr = '';
      if (direction === 'forward') {
        neighborNodeExpr = 'e.to_node_id';
      } else if (direction === 'backward') {
        neighborNodeExpr = 'e.from_node_id';
      } else {
        neighborNodeExpr = 'CASE WHEN e.from_node_id = $1::uuid THEN e.to_node_id ELSE e.from_node_id END';
      }

      const query = `
        SELECT
          ${neighborNodeExpr} AS neighbor_id,
          e.id AS edge_id,
          et.code AS edge_type_code,
          n.title AS node_title,
          nt.code AS node_type_code,
          n.created_at AS node_created_at
        FROM edges e
        JOIN edge_types et ON et.id = e.edge_type_id
        JOIN nodes n ON n.id = ${neighborNodeExpr}
        JOIN node_types nt ON nt.id = n.node_type_id
        WHERE ${directionWhere}
          AND ${filterWhere}
          AND n.user_id = $${params.length + 1}::integer
          AND n.deleted_at IS NULL
          AND ${neighborNodeExpr} != $1::uuid
      `;

      params.push(userId);

      const result = await this.pool.query(query, params);

      for (const row of result.rows) {
        const neighborId = row.neighbor_id;

        if (visited.has(neighborId)) continue;

        // Check node type filter
        if (options.filterNodeType && row.node_type_code !== options.filterNodeType) {
          continue;
        }

        visited.add(neighborId);

        path.push({
          node_id: neighborId,
          node_title: row.node_title,
          node_type_code: row.node_type_code,
          depth: current.depth + 1,
        });

        edges.push({
          edge_id: row.edge_id,
          edge_type_code: row.edge_type_code,
          from_node: current.nodeId,
          to_node: neighborId,
        });

        queue.push({
          nodeId: neighborId,
          depth: current.depth + 1,
          parentNodeId: current.nodeId,
        });
      }
    }

    return { path, edges };
  }

  async getNeighbors(nodeId: string, userId: number) {
    const result = await this.pool.query(
      `SELECT DISTINCT
        neighbor.id AS node_id,
        neighbor.node_type_id,
        nt.code AS node_type_code,
        neighbor.title AS node_title,
        COUNT(e.id) AS link_count
      FROM edges e
      JOIN nodes neighbor ON (neighbor.id = e.from_node_id OR neighbor.id = e.to_node_id)
        AND neighbor.id != $1
      JOIN node_types nt ON nt.id = neighbor.node_type_id
      JOIN nodes anchor ON (anchor.id = e.from_node_id OR anchor.id = e.to_node_id)
        AND anchor.id = $1 AND anchor.user_id = $2
      WHERE e.deleted_at IS NULL
        AND neighbor.deleted_at IS NULL
      GROUP BY neighbor.id, neighbor.node_type_id, nt.code, neighbor.title, nt.name
      ORDER BY link_count DESC`,
      [nodeId, userId]
    );
    return result.rows;
  }
}