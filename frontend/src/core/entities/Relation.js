export class Relation {
  constructor(data) {
    this.id = data.id;
    this.fromEntryId = data.fromEntryId;
    this.toEntryId = data.toEntryId;
    this.relationType = data.relationType; // led_to, reminded_of, inspired_by, etc.
    this.description = data.description;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    
    // Опционально загруженные записи
    this.fromEntry = data.fromEntry || null;
    this.toEntry = data.toEntry || null;
  }

  getTypeLabel() {
    const labels = {
      led_to: 'Привело к',
      reminded_of: 'Напомнило о',
      inspired_by: 'Вдохновлено',
      caused_by: 'Вызвано',
      related_to: 'Связано с',
      resulted_in: 'Привело к результату'
    };
    return labels[this.relationType] || this.relationType;
  }

  getDirection() {
    const directions = {
      led_to: 'forward',
      reminded_of: 'backward',
      inspired_by: 'backward',
      caused_by: 'backward',
      related_to: 'both',
      resulted_in: 'forward'
    };
    return directions[this.relationType] || 'both';
  }
}