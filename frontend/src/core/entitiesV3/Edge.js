export class Edge {
  static EDGE_TYPES = [
    'mentions', 'caused', 'resulted_in', 'inspired',
    'reminded_of', 'about', 'contains', 'performed_with',
    'completed_by', 'created', 'references', 'symbolizes',
    'contradicts', 'depends_on', 'belongs_to', 'related_to'
  ];

  constructor(data) {
    this.id = data.id;
    this.fromNodeId = data.from_node_id || data.fromNodeId;
    this.toNodeId = data.to_node_id || data.toNodeId;
    this.edgeTypeCode = data.edge_type_code || data.edgeTypeCode;
    this.confidence = data.confidence;
    this.weight = data.weight;
    this.createdAt = data.created_at ? data.created_at : data.createdAt;
    this.notes = data.notes;
  }

  getEdgeTypeLabel() {
    const labels = {
      mentions: 'Упоминает',
      caused: 'Причина',
      resulted_in: 'Привело к',
      inspired: 'Вдохновило',
      reminded_of: 'Напомнило',
      about: 'О',
      contains: 'Содержит',
      performed_with: 'Выполнено с',
      completed_by: 'Завершено',
      created: 'Создало',
      references: 'Ссылается на',
      symbolizes: 'Символизирует',
      contradicts: 'Противоречит',
      depends_on: 'Зависит от',
      belongs_to: 'Надлежит',
      related_to: 'Связано с'
    };
    return labels[this.edgeTypeCode] || this.edgeTypeCode;
  }
}

export const EDGE_TYPES = Edge.EDGE_TYPES;