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
export declare function getReferenceCache(): Promise<{
    nodeTypeCache: Record<string, NodeTypeIdCache>;
    edgeTypeCache: Record<string, EdgeTypeIdCache>;
    emotionCache: Record<string, EmotionIdCache>;
    measurementCache: Record<string, MeasurementDefinitionIdCache>;
}>;
export declare function cacheReferenceData(): Promise<void>;
export declare function invalidateReferenceCache(category: 'node_type' | 'edge_type' | 'emotion' | 'measurement'): Promise<void>;
export declare function getNodeTypeFromCache(code: string): Promise<number | null>;
export declare function getEdgeTypeFromCache(code: string): Promise<number | null>;
export declare function getEmotionFromCache(code: string): Promise<number | null>;
export declare function getMeasurementFromCache(code: string): Promise<number | null>;
export {};
//# sourceMappingURL=referenceCache.d.ts.map