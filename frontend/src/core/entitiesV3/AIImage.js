export class AIImage {
  constructor(data) {
    this.id = data.id;
    this.nodeId = data.node_id || data.nodeId;
    this.imageUrl = data.image_url || data.imageUrl;
    this.prompt = data.prompt;
    this.metadata = data.metadata;
    this.aiModel = data.ai_model || data.aiModel;
    this.createdAt = data.created_at ? data.created_at : data.createdAt;
  }
}