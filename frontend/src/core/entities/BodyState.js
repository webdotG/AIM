export class BodyState {
  constructor({
    id = null,
    userId = null,
    timestamp = new Date(),
    locationPoint = null,
    locationName = null,
    locationAddress = null,
    locationPrecision = null,
    healthPoints = null,
    energyPoints = null,
    circumstanceId = null,
    createdAt = new Date()
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
    this.locationPoint = locationPoint;
    this.locationName = locationName;
    this.locationAddress = locationAddress;
    this.locationPrecision = locationPrecision;
    this.healthPoints = healthPoints;
    this.energyPoints = energyPoints;
    this.circumstanceId = circumstanceId;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  // Геттер для форматированной даты
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

  // Метод для получения сводки состояния
  getSummary() {
    const parts = [];
    
    if (this.healthPoints !== null) parts.push(`Здоровье: ${this.healthPoints}/100`);
    if (this.energyPoints !== null) parts.push(`Энергия: ${this.energyPoints}/100`);
    if (this.locationName) parts.push(`Место: ${this.locationName}`);

    return parts.length > 0 ? parts.join(', ') : 'Данные о состоянии не указаны';
  }

  // Метод для проверки наличия данных о местоположении
  hasLocation() {
    return !!(this.locationPoint || this.locationName || this.locationAddress);
  }

  // Метод для получения полного местоположения
  getFullLocation() {
    if (this.locationName && this.locationAddress) {
      return `${this.locationName}, ${this.locationAddress}`;
    }
    return this.locationName || this.locationAddress || 'Местоположение не указано';
  }

  // Метод для клонирования
  clone() {
    return new BodyState({ ...this });
  }

  // Метод для обновления
  update(updates) {
    return new BodyState({ ...this, ...updates });
  }

  // Статический метод для создания из сырых данных
  static fromRaw(rawData) {
    return new BodyState({
      id: rawData.id,
      userId: rawData.user_id || rawData.userId,
      timestamp: rawData.timestamp,
      locationPoint: rawData.location_point || rawData.locationPoint,
      locationName: rawData.location_name || rawData.locationName,
      locationAddress: rawData.location_address || rawData.locationAddress,
      locationPrecision: rawData.location_precision || rawData.locationPrecision,
      healthPoints: rawData.health_points || rawData.healthPoints,
      energyPoints: rawData.energy_points || rawData.energyPoints,
      circumstanceId: rawData.circumstance_id || rawData.circumstanceId,
      createdAt: rawData.created_at || rawData.createdAt
    });
  }

  // Статический метод для создания пустого объекта
  static empty() {
    return new BodyState({
      timestamp: new Date()
    });
  }

  // Статический метод для валидации
  static validate(bodyState) {
    const errors = [];

    if (bodyState.healthPoints !== null && 
        (bodyState.healthPoints < 0 || bodyState.healthPoints > 100)) {
      errors.push('Показатель здоровья должен быть в диапазоне от 0 до 100');
    }

    if (bodyState.energyPoints !== null && 
        (bodyState.energyPoints < 0 || bodyState.energyPoints > 100)) {
      errors.push('Показатель энергии должен быть в диапазоне от 0 до 100');
    }

    return errors;
  }
}

export default BodyState;