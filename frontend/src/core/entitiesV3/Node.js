export class Node {
  static NODE_TYPES = [
    'dream', 'thought', 'memory', 'plan', 'action',
    'person', 'place', 'book', 'project', 'conversation',
    'movie', 'course', 'website', 'music', 'article'
  ];

  static TYPE_ICONS = {
    dream: '💭',
    thought: '💡',
    memory: '📷',
    plan: '📋',
    action: '⚡',
    person: '👤',
    place: '📍',
    book: '📚',
    project: '🚀',
    conversation: '💬',
    movie: '🎬',
    course: '🎓',
    website: '🌐',
    music: '🎵',
    article: '📄'
  };

  static TYPE_LABELS = {
    dream: 'Сон',
    thought: 'Мысль',
    memory: 'Воспоминание',
    plan: 'План',
    action: 'Действие',
    person: 'Человек',
    place: 'Место',
    book: 'Книга',
    project: 'Проект',
    conversation: 'Разговор',
    movie: 'Фильм',
    course: 'Курс',
    website: 'Сайт',
    music: 'Музыка',
    article: 'Статья'
  };

  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.nodeTypeCode = data.node_type_code || data.nodeTypeCode;
    this.title = data.title;
    this.createdAt = data.created_at ? data.created_at : data.createdAt;
    this.updatedAt = data.updated_at ? data.updated_at : data.updatedAt;
    this.deletedAt = data.deleted_at ? data.deleted_at : data.deletedAt;
    this.measurement = data.measurement || [];
    this.edges = data.edges || [];
    this.emotions = data.emotions || [];
    this.tags = data.tags || [];
    this.analysis = data.analysis || [];
    this.images = data.images || [];
  }

  isDream() {
    return this.nodeTypeCode === 'dream';
  }

  isThought() {
    return this.nodeTypeCode === 'thought';
  }

  isMemory() {
    return this.nodeTypeCode === 'memory';
  }

  isPlan() {
    return this.nodeTypeCode === 'plan';
  }

  isAction() {
    return this.nodeTypeCode === 'action';
  }

  isPerson() {
    return this.nodeTypeCode === 'person';
  }

  isPlace() {
    return this.nodeTypeCode === 'place';
  }

  isArchived() {
    return !!this.deletedAt;
  }

  isEditable() {
    return !this.isArchived();
  }

  displayTitle() {
    return this.title || `Node (${this.nodeTypeCode})`;
  }

  hasEmotion() {
    return this.emotions && this.emotions.length > 0;
  }

  icon() {
    return Node.TYPE_ICONS[this.nodeTypeCode] || '📝';
  }

  label() {
    return Node.TYPE_LABELS[this.nodeTypeCode] || this.nodeTypeCode;
  }

  getDominantEmotion() {
    if (!this.emotions || this.emotions.length === 0) return null;
    return this.emotions.reduce((prev, current) =>
      (current.intensity > prev.intensity) ? current : prev
    );
  }

  getAverageEmotionIntensity() {
    if (!this.emotions || this.emotions.length === 0) return 0;
    const sum = this.emotions.reduce((acc, e) => acc + e.intensity, 0);
    return sum / this.emotions.length;
  }
}

export const NODE_TYPES = Node.NODE_TYPES;
export const NODE_TYPE_ICONS = Node.TYPE_ICONS;
export const NODE_TYPE_LABELS = Node.TYPE_LABELS;