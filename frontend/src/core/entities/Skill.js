export class Skill {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.category = data.category; // social, technical, creative, physical, etc.
    this.description = data.description;
    this.currentLevel = data.currentLevel || 1; // 1-100
    this.experiencePoints = data.experiencePoints || 0;
    this.icon = data.icon;
    this.color = data.color;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  // Бизнес-логика
  getProgressToNextLevel() {
    const currentLevelXP = (this.currentLevel - 1) * 100;
    const nextLevelXP = this.currentLevel * 100;
    const progressXP = this.experiencePoints - currentLevelXP;
    return (progressXP / 100) * 100; // Процент до следующего уровня
  }

  getXPToNextLevel() {
    const nextLevelXP = this.currentLevel * 100;
    return nextLevelXP - this.experiencePoints;
  }

  canLevelUp() {
    return this.experiencePoints >= this.currentLevel * 100 && this.currentLevel < 100;
  }

  getLevelTier() {
    if (this.currentLevel >= 80) return 'master';
    if (this.currentLevel >= 60) return 'expert';
    if (this.currentLevel >= 40) return 'advanced';
    if (this.currentLevel >= 20) return 'intermediate';
    return 'beginner';
  }

  // Расчёт уровня из опыта
  static calculateLevel(experiencePoints) {
    return Math.min(100, Math.floor(1 + experiencePoints / 100));
  }
}