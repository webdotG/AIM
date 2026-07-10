"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgesRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
class EdgesRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async findByNode(nodeId, direction = 'both') {
        let condition = '';
        if (direction === 'outgoing') {
            condition = 'e.from_node_id = $1';
        }
        else if (direction === 'incoming') {
            condition = 'e.to_node_id = $1';
        }
        else {
            condition = '(e.from_node_id = $1 OR e.to_node_id = $1)';
        }
        const result = await this.pool.query(`SELECT e.*, et.code AS edge_type_code, et.name AS edge_type_name
       FROM edges e
       JOIN edge_types et ON et.id = e.edge_type_id
       WHERE ${condition} AND e.deleted_at IS NULL
       ORDER BY e.created_at DESC`, [nodeId]);
        return result.rows;
    }
    async create(fromNodeId, toNodeId, edgeTypeCode, confidence = null, weight = null, notes = null) {
        const result = await this.pool.query(`INSERT INTO edges (from_node_id, to_node_id, edge_type_id, confidence, weight, notes)
       SELECT $1, $2, et.id, $3, $4, $5
       FROM edge_types et WHERE et.code = $6
       RETURNING id, from_node_id, to_node_id, edge_type_id, confidence, weight, created_at, notes, deleted_at`, [fromNodeId, toNodeId, confidence, weight, notes, edgeTypeCode]);
        return result.rows[0];
    }
    async softDelete(id) {
        const result = await this.pool.query(`UPDATE edges SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`, [id]);
        return result.rows[0] || null;
    }
    async findChain(startNodeId, direction = 'both', depth = 10) {
        let directionCond = '';
        if (direction === 'forward') {
            directionCond = 'e.from_node_id = curr.node';
        }
        else if (direction === 'backward') {
            directionCond = 'e.to_node_id = curr.node';
        }
        else {
            directionCond = '(e.from_node_id = curr.node OR e.to_node_id = curr.node)';
        }
        let nextNode = '';
        if (direction === 'forward') {
            nextNode = 'e.to_node_id';
        }
        else if (direction === 'backward') {
            nextNode = 'e.from_node_id';
        }
        else {
            nextNode = 'CASE WHEN e.from_node_id = curr.node THEN e.to_node_id ELSE e.from_node_id END';
        }
        const result = await this.pool.query(`WITH RECURSIVE traversal AS (
        SELECT $1::text AS node, 0 AS depth, ARRAY[$1::text] AS path
        UNION ALL
        SELECT ${nextNode}::text, curr.depth + 1, curr.path || ${nextNode}::text
        FROM traversal curr
        JOIN edges e ON ${directionCond}
        WHERE curr.depth < $2
          AND e.deleted_at IS NULL
          AND ${nextNode}::text != ALL(curr.path)
      )
      SELECT * FROM traversal WHERE depth > 0 ORDER BY depth, node`, [startNodeId, depth]);
        return result.rows;
    }
    async getGraphData(userId) {
        const nodesResult = await this.pool.query(`SELECT n.id, n.node_type_id, nt.code AS node_type_code, n.title
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       WHERE n.user_id = $1 AND n.deleted_at IS NULL`, [userId]);
        const edgesResult = await this.pool.query(`SELECT e.id, e.from_node_id, e.to_node_id, et.code AS edge_type_code, e.confidence, e.weight
       FROM edges e
       JOIN edge_types et ON et.id = e.edge_type_id
       WHERE e.deleted_at IS NULL
         AND EXISTS (SELECT 1 FROM nodes n WHERE n.id = e.from_node_id AND n.user_id = $1 AND n.deleted_at IS NULL)
         AND EXISTS (SELECT 1 FROM nodes n WHERE n.id = e.to_node_id AND n.user_id = $1 AND n.deleted_at IS NULL)`, [userId]);
        return {
            nodes: nodesResult.rows,
            edges: edgesResult.rows,
        };
    }
    async getMostConnected(userId, limit = 10) {
        const result = await this.pool.query(`SELECT n.id, n.title, nt.code AS node_type_code,
              COUNT(e.id) AS connection_count
       FROM nodes n
       JOIN node_types nt ON nt.id = n.node_type_id
       LEFT JOIN edges e ON (e.from_node_id = n.id OR e.to_node_id = n.id) AND e.deleted_at IS NULL
       WHERE n.user_id = $1 AND n.deleted_at IS NULL
       GROUP BY n.id, n.title, nt.code
       HAVING COUNT(e.id) > 0
       ORDER BY connection_count DESC
       LIMIT $2`, [userId, limit]);
        return result.rows;
    }
}
exports.EdgesRepository = EdgesRepository;
//# sourceMappingURL=EdgesRepository.js.map