export class SkillMapper {
  static toDomain(dto) {
    if (!dto) return null;

    return {
      id: dto.id,
      userId: dto.user_id,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      targetLevel: dto.target_level,
      currentLevel: dto.current_level,
      progress: dto.progress || [],
      isActive: dto.is_active,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  static toDTO(skill) {
    return {
      name: skill.name,
      description: skill.description,
      category: skill.category,
      target_level: skill.targetLevel,
      current_level: skill.currentLevel,
      is_active: skill.isActive
    };
  }

  static toDomainArray(dtos) {
    return dtos.map(dto => this.toDomain(dto));
  }
}