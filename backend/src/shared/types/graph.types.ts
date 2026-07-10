export enum NodeTypeCode {
  DREAM = 'dream',
  THOUGHT = 'thought',
  MEMORY = 'memory',
  PLAN = 'plan',
  ACTION = 'action',
  PERSON = 'person',
  PLACE = 'place',
  BOOK = 'book',
  PROJECT = 'project',
  CONVERSATION = 'conversation',
  MOVIE = 'movie',
  COURSE = 'course',
  WEBSITE = 'website',
  MUSIC = 'music',
  ARTICLE = 'article',
}

export interface NodeType {
  id: number;
  code: NodeTypeCode;
  name: string;
  description: string | null;
}

export interface Node {
  id: string;
  user_id: number;
  node_type_id: number;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateNodeInput {
  user_id: number;
  node_type_code: NodeTypeCode;
  title?: string | null;
}

export interface UpdateNodeInput {
  title?: string | null;
}

export enum EdgeTypeCode {
  MENTIONS = 'mentions',
  CAUSED = 'caused',
  RESULTED_IN = 'resulted_in',
  INSPIRED = 'inspired',
  REMINDED_OF = 'reminded_of',
  ABOUT = 'about',
  CONTAINS = 'contains',
  PERFORMED_WITH = 'performed_with',
  COMPLETED_BY = 'completed_by',
  CREATED = 'created',
  REFERENCES = 'references',
  SYMBOLIZES = 'symbolizes',
  CONTRADICTS = 'contradicts',
  DEPENDS_ON = 'depends_on',
  BELONGS_TO = 'belongs_to',
  RELATED_TO = 'related_to',
}

export interface EdgeType {
  id: number;
  code: EdgeTypeCode;
  name: string;
  description: string | null;
}

export interface Edge {
  id: number;
  from_node_id: string;
  to_node_id: string;
  edge_type_id: number;
  confidence: number | null;
  weight: number | null;
  created_at: Date;
  notes: string | null;
  deleted_at: Date | null;
}

export interface CreateEdgeInput {
  from_node_id: string;
  to_node_id: string;
  edge_type_code: EdgeTypeCode;
  confidence?: number | null;
  weight?: number | null;
  notes?: string | null;
}