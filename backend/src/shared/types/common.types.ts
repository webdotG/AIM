import { NodeTypeCode, EdgeTypeCode } from './graph.types';
import { EmotionCategory, MeasurementDataType } from './domain.types';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
}

export interface NodeTag {
  node_id: string;
  tag_id: number;
}

export interface ActivityInput {
  parent_id?: number | null;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}

export interface AIAnalysisResult {
  id: number;
  node_id: string;
  analysis_type: string;
  ai_model: string | null;
  prompt: string | null;
  result: string;
  metadata: unknown;
  created_at: Date;
}

export type NodeFilterType = NodeTypeCode;

export const VALID_NODE_TYPES = Object.values(NodeTypeCode);
export const VALID_EDGE_TYPES = Object.values(EdgeTypeCode);
export const VALID_EMOTION_CATEGORIES = Object.values(EmotionCategory);
export const VALID_MEASUREMENT_DATA_TYPES = Object.values(MeasurementDataType);