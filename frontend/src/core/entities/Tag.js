export class Tag {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.usageCount = data.usageCount || 0; // Из JOIN с entry_tags
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  isPopular() {
    return this.usageCount > 10;
  }

  isUnused() {
    return this.usageCount === 0;
  }
}