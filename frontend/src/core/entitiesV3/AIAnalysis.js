export class AIAnalysis {
  constructor(data) {
    this.id = data.id;
    this.nodeId = data.node_id || data.nodeId;
    this.analysisType = data.analysis_type || data.analysisType;
    this.result = data.result;
    this.aiModel = data.ai_model || data.aiModel;
    this.prompt = data.prompt;
    this.metadata = data.metadata;
    this.createdAt = data.created_at ? data.created_at : data.createdAt;
  }
}