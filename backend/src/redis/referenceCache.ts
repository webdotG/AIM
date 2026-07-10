import { getRedis } from '../redis/pool';

interface NodeTypeIdCache {
  node_type_id: number;
  node_type_name: string;
}

interface EdgeTypeIdCache {
  edge_type_id: number;
  edge_type_name: string;
}

interface EmotionIdCache {
  emotion_id: number;
  emotion_name: string;
}

interface MeasurementDefinitionIdCache {
  measurement_id: number;
  measurement_name: string;
}

async function scanKeys(redis: any, pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';
  
  do {
    const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 50);
    cursor = result[0];
    const batch = result[1];
    if (batch) {
      keys.push(...batch);
    }
  } while (cursor !== '0');
  
  return keys;
}

export async function getReferenceCache() {
  const redis = await getRedis();
  
  const nodeTypeCache: Record<string, NodeTypeIdCache> = {};
  const edgeTypeCache: Record<string, EdgeTypeIdCache> = {};
  const emotionCache: Record<string, EmotionIdCache> = {};
  const measurementCache: Record<string, MeasurementDefinitionIdCache> = {};

  // Get all cached reference data
  const nodeTypeKeys = await scanKeys(redis, 'ref:node_type:*');
  const edgeTypeKeys = await scanKeys(redis, 'ref:edge_type:*');
  const emotionKeys = await scanKeys(redis, 'ref:emotion:*');
  const measurementKeys = await scanKeys(redis, 'ref:measurement:*');

  for (const key of nodeTypeKeys) {
    const value = await redis.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      nodeTypeCache[key.replace('ref:node_type:', '')] = parsed;
    }
  }

  for (const key of edgeTypeKeys) {
    const value = await redis.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      edgeTypeCache[key.replace('ref:edge_type:', '')] = parsed;
    }
  }

  for (const key of emotionKeys) {
    const value = await redis.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      emotionCache[key.replace('ref:emotion:', '')] = parsed;
    }
  }

  for (const key of measurementKeys) {
    const value = await redis.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      measurementCache[key.replace('ref:measurement:', '')] = parsed;
    }
  }

  return {
    nodeTypeCache,
    edgeTypeCache,
    emotionCache,
    measurementCache,
  };
}

export async function cacheReferenceData() {
  const redis = await getRedis();

  // Import pg pool to query reference tables
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { pool } = require('../db/pool');

  // Cache node_types
  const nodeTypesResult = await pool.query('SELECT code, id, name FROM node_types');
  for (const row of nodeTypesResult.rows) {
    const cacheKey = `ref:node_type:${row.code}`;
    await redis.set(cacheKey, JSON.stringify({
      node_type_id: row.id,
      node_type_name: row.name,
    }), 'EX', 86400);
  }

  // Cache edge_types
  const edgeTypesResult = await pool.query('SELECT code, id, name FROM edge_types');
  for (const row of edgeTypesResult.rows) {
    const cacheKey = `ref:edge_type:${row.code}`;
    await redis.set(cacheKey, JSON.stringify({
      edge_type_id: row.id,
      edge_type_name: row.name,
    }), 'EX', 86400);
  }

  // Cache emotions
  const emotionsResult = await pool.query('SELECT code, id, name_en FROM emotions');
  for (const row of emotionsResult.rows) {
    const cacheKey = `ref:emotion:${row.code}`;
    await redis.set(cacheKey, JSON.stringify({
      emotion_id: row.id,
      emotion_name: row.name_en,
    }), 'EX', 86400);
  }

  // Cache measurement_definitions
  const measurementsResult = await pool.query('SELECT code, id, name FROM measurement_definitions');
  for (const row of measurementsResult.rows) {
    const cacheKey = `ref:measurement:${row.code}`;
    await redis.set(cacheKey, JSON.stringify({
      measurement_id: row.id,
      measurement_name: row.name,
    }), 'EX', 86400);
  }

  console.log('[Reference Cache] Cached all reference data');
}

export async function invalidateReferenceCache(category: 'node_type' | 'edge_type' | 'emotion' | 'measurement') {
  const redis = await getRedis();
  const pattern = `ref:${category}:*`;

  // Delete matching keys
  const keys = await scanKeys(redis, pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

export async function getNodeTypeFromCache(code: string): Promise<number | null> {
  const redis = await getRedis();
  const cached = await redis.get(`ref:node_type:${code}`);
  if (cached) {
    return JSON.parse(cached).node_type_id;
  }
  return null;
}

export async function getEdgeTypeFromCache(code: string): Promise<number | null> {
  const redis = await getRedis();
  const cached = await redis.get(`ref:edge_type:${code}`);
  if (cached) {
    return JSON.parse(cached).edge_type_id;
  }
  return null;
}

export async function getEmotionFromCache(code: string): Promise<number | null> {
  const redis = await getRedis();
  const cached = await redis.get(`ref:emotion:${code}`);
  if (cached) {
    return JSON.parse(cached).emotion_id;
  }
  return null;
}

export async function getMeasurementFromCache(code: string): Promise<number | null> {
  const redis = await getRedis();
  const cached = await redis.get(`ref:measurement:${code}`);
  if (cached) {
    return JSON.parse(cached).measurement_id;
  }
  return null;
}