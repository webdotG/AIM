"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferenceCache = getReferenceCache;
exports.cacheReferenceData = cacheReferenceData;
exports.invalidateReferenceCache = invalidateReferenceCache;
exports.getNodeTypeFromCache = getNodeTypeFromCache;
exports.getEdgeTypeFromCache = getEdgeTypeFromCache;
exports.getEmotionFromCache = getEmotionFromCache;
exports.getMeasurementFromCache = getMeasurementFromCache;
const pool_1 = require("../redis/pool");
async function scanKeys(redis, pattern) {
    const keys = [];
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
async function getReferenceCache() {
    const redis = await (0, pool_1.getRedis)();
    const nodeTypeCache = {};
    const edgeTypeCache = {};
    const emotionCache = {};
    const measurementCache = {};
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
async function cacheReferenceData() {
    const redis = await (0, pool_1.getRedis)();
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
async function invalidateReferenceCache(category) {
    const redis = await (0, pool_1.getRedis)();
    const pattern = `ref:${category}:*`;
    // Delete matching keys
    const keys = await scanKeys(redis, pattern);
    if (keys.length > 0) {
        await redis.del(keys);
    }
}
async function getNodeTypeFromCache(code) {
    const redis = await (0, pool_1.getRedis)();
    const cached = await redis.get(`ref:node_type:${code}`);
    if (cached) {
        return JSON.parse(cached).node_type_id;
    }
    return null;
}
async function getEdgeTypeFromCache(code) {
    const redis = await (0, pool_1.getRedis)();
    const cached = await redis.get(`ref:edge_type:${code}`);
    if (cached) {
        return JSON.parse(cached).edge_type_id;
    }
    return null;
}
async function getEmotionFromCache(code) {
    const redis = await (0, pool_1.getRedis)();
    const cached = await redis.get(`ref:emotion:${code}`);
    if (cached) {
        return JSON.parse(cached).emotion_id;
    }
    return null;
}
async function getMeasurementFromCache(code) {
    const redis = await (0, pool_1.getRedis)();
    const cached = await redis.get(`ref:measurement:${code}`);
    if (cached) {
        return JSON.parse(cached).measurement_id;
    }
    return null;
}
//# sourceMappingURL=referenceCache.js.map