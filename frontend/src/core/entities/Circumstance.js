export class Circumstance {
  constructor({
    id = null,
    userId = null,
    timestamp = new Date(),
    weather = null,
    temperature = null,
    moonPhase = null,
    globalEvent = null,
    notes = null,
    createdAt = new Date()
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
    this.weather = weather;
    this.temperature = temperature;
    this.moonPhase = moonPhase;
    this.globalEvent = globalEvent;
    this.notes = notes;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  // Геттер для удобного форматирования даты
  get formattedDate() {
    return this.timestamp.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Геттер для времени
  get formattedTime() {
    return this.timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Геттер для полной даты и времени
  get fullDateTime() {
    return `${this.formattedDate} в ${this.formattedTime}`;
  }

  // Метод для получения сводки обстоятельств
  getSummary() {
    const parts = [];
    
    if (this.weather) parts.push(`Погода: ${this.weather}`);
    if (this.temperature !== null) parts.push(`Температура: ${this.temperature}°C`);
    if (this.moonPhase) parts.push(`Фаза луны: ${this.moonPhase}`);
    if (this.globalEvent) parts.push(`Событие: ${this.globalEvent}`);
    if (this.notes) parts.push(`Заметки: ${this.notes}`);

    return parts.length > 0 ? parts.join(', ') : 'Обстоятельства не указаны';
  }

  // Метод для проверки, есть ли данные об обстоятельствах
  hasData() {
    return !!(this.weather || this.temperature !== null || this.moonPhase || this.globalEvent || this.notes);
  }

  // Метод для клонирования объекта
  clone() {
    return new Circumstance({ ...this });
  }

  // Метод для обновления свойств
  update(updates) {
    return new Circumstance({ ...this, ...updates });
  }

  // Статический метод для создания из сырых данных
  static fromRaw(rawData) {
    return new Circumstance({
      id: rawData.id,
      userId: rawData.user_id || rawData.userId,
      timestamp: rawData.timestamp,
      weather: rawData.weather,
      temperature: rawData.temperature,
      moonPhase: rawData.moon_phase || rawData.moonPhase,
      globalEvent: rawData.global_event || rawData.globalEvent,
      notes: rawData.notes,
      createdAt: rawData.created_at || rawData.createdAt
    });
  }

  // Статический метод для создания пустого объекта
  static empty() {
    return new Circumstance({
      timestamp: new Date()
    });
  }

  // Статический метод для валидации
  static validate(circumstance) {
    const errors = [];

    if (circumstance.temperature !== null && 
        (isNaN(circumstance.temperature) || circumstance.temperature < -100 || circumstance.temperature > 100)) {
      errors.push('Температура должна быть в диапазоне от -100 до 100°C');
    }

    if (circumstance.notes && circumstance.notes.length > 1000) {
      errors.push('Заметки не должны превышать 1000 символов');
    }

    return errors;
  }
}

export default Circumstance;