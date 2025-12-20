export class Person {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.category = data.category; // family, friends, acquaintances, strangers
    this.relationship = data.relationship;
    this.bio = data.bio;
    this.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    this.notes = data.notes;
    this.mentionCount = data.mentionCount || 0; // Из JOIN с entry_people
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  isFamily() {
    return this.category === 'family';
  }

  isFriend() {
    return this.category === 'friends';
  }

  getCategoryIcon() {
    const icons = {
      family: '👨‍👩‍👧‍👦',
      friends: '👥',
      acquaintances: '🤝',
      strangers: '👤'
    };
    return icons[this.category] || '👤';
  }

  isFrequentlyMentioned() {
    return this.mentionCount > 5;
  }
}