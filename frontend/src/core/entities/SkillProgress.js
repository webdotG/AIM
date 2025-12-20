export class SkillProgress {
  constructor(data) {
    this.id = data.id;
    this.skillId = data.skillId;
    this.entryId = data.entryId;
    this.bodyStateId = data.bodyStateId;
    this.progressType = data.progressType; // practice, achievement, lesson, milestone
    this.experienceGained = data.experienceGained || 10;
    this.notes = data.notes;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  getProgressTypeIcon() {
    const icons = {
      practice: '🏋️',
      achievement: '🏆',
      lesson: '📚',
      milestone: '🎯'
    };
    return icons[this.progressType] || '✨';
  }
}