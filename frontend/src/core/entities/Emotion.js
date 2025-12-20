export class Emotion {
  constructor(data) {
    this.id = data.id;
    this.nameEn = data.nameEn;
    this.nameRu = data.nameRu;
    this.category = data.category; // positive, negative, neutral
    this.description = data.description;
    this.parentEmotionId = data.parentEmotionId;
  }

  isPositive() {
    return this.category === 'positive';
  }

  isNegative() {
    return this.category === 'negative';
  }

  isNeutral() {
    return this.category === 'neutral';
  }

  getCategoryIcon() {
    const icons = {
      positive: '😊',
      negative: '😔',
      neutral: '😐'
    };
    return icons[this.category] || '😶';
  }

  // Для использования с интенсивностью
  static createWithIntensity(emotion, intensity) {
    return {
      ...emotion,
      intensity: Math.max(1, Math.min(10, intensity)) // 1-10
    };
  }
}
