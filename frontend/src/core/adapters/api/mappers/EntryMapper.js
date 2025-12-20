export class EntryMapper {
  static toDomain(dto) {
    if (!dto) return null;

    return {
      id: dto.id,
      userId: dto.user_id,
      type: dto.entry_type, // маппинг с entry_type
      content: dto.content,
      emotions: dto.emotions || [],
      people: dto.people || [],
      tags: dto.tags || [],
      relations: dto.relations || {},
      isCompleted: dto.is_completed || false,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      circumstanceId: dto.circumstance_id,
      bodyStateId: dto.body_state_id,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  static toDTO(entry) {
    return {
      entry_type: entry.type, // маппинг на entry_type
      content: entry.content,
      emotions: entry.emotions || [],
      people: entry.people || [],
      tags: entry.tags || [],
      is_completed: entry.isCompleted || false,
      deadline: entry.deadline?.toISOString() || null,
      circumstance_id: entry.circumstanceId || null,
      body_state_id: entry.bodyStateId || null
    };
  }

  static toDomainArray(dtos) {
    return dtos.map(dto => this.toDomain(dto));
  }
}