export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

export interface Emotion {
  id: number;
  code: string;
  name_ru: string;
  name_en: string;
  category: EmotionCategory;
}

export interface NodeEmotion {
  id: number;
  node_id: string;
  emotion_id: number;
  intensity: number;
  created_at: Date;
}

export interface AssignNodeEmotionInput {
  emotion_id: number;
  intensity: number;
}

export enum MeasurementDataType {
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  TEXT = 'text',
}

export interface MeasurementDefinition {
  id: number;
  code: string;
  name: string;
  description: string | null;
  data_type: MeasurementDataType;
  default_unit: string | null;
  min_value: number | null;
  max_value: number | null;
}

export interface NodeMeasurement {
  id: number;
  node_id: string;
  measurement_id: number;
  value_integer: number | null;
  value_decimal: number | null;
  value_boolean: boolean | null;
  value_text: string | null;
  unit: string | null;
  measured_at: Date;
}

export interface CreateNodeMeasurementInput {
  measurement_id: number;
  value_integer?: number | null;
  value_decimal?: number | null;
  value_boolean?: boolean | null;
  value_text?: string | null;
  unit?: string | null;
}