export class Entry {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.entryType = data.entryType; // dream, memory, thought, plan
    this.content = data.content;
    
    // НОВЫЕ ОПЦИОНАЛЬНЫЕ СВЯЗИ
    this.bodyStateId = data.bodyStateId;
    this.circumstanceId = data.circumstanceId;
    
    // Для планов
    this.deadline = data.deadline ? new Date(data.deadline) : null;
    this.isCompleted = data.isCompleted || false;
    
    // Связанные данные (загружаются отдельно)
    this.emotions = data.emotions || [];
    this.people = data.people || [];
    this.tags = data.tags || [];
    this.relations = data.relations || null;
    
    // Опционально загруженные связи
    this.bodyState = data.bodyState || null; // BodyState entity
    this.circumstance = data.circumstance || null; // Circumstance entity
    
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Бизнес-логика
  isDream() {
    return this.entryType === 'dream';
  }

  isMemory() {
    return this.entryType === 'memory';
  }

  isThought() {
    return this.entryType === 'thought';
  }

  isPlan() {
    return this.entryType === 'plan';
  }

  isOverdue() {
    return this.isPlan() && !this.isCompleted && this.deadline && new Date() > this.deadline;
  }

  hasLocation() {
    return !!this.bodyStateId;
  }

  hasCircumstances() {
    return !!this.circumstanceId;
  }

  getTypeIcon() {
    const icons = {
      dream: '💭',
      memory: '📷',
      thought: '💡',
      plan: '📋'
    };
    return icons[this.entryType] || '📝';
  }

  // Получить самую сильную эмоцию
  getDominantEmotion() {
    if (!this.emotions || this.emotions.length === 0) return null;
    return this.emotions.reduce((prev, current) => 
      (current.intensity > prev.intensity) ? current : prev
    );
  }

  // Средняя интенсивность эмоций
  getAverageEmotionIntensity() {
    if (!this.emotions || this.emotions.length === 0) return 0;
    const sum = this.emotions.reduce((acc, e) => acc + e.intensity, 0);
    return sum / this.emotions.length;
  }
}