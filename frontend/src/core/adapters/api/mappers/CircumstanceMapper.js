export class CircumstanceMapper {
  static toDomain(dto) {
    if (!dto) return null;

    return {
      id: dto.id,
      userId: dto.user_id,
      timestamp: new Date(dto.timestamp),
      weather: dto.weather,
      temperature: dto.temperature,
      moonPhase: dto.moon_phase,
      globalEvent: dto.global_event,
      notes: dto.notes,
      createdAt: new Date(dto.created_at)
    };
  }

  static toDTO(circumstance) {
    return {
      timestamp: circumstance.timestamp?.toISOString(),
      weather: circumstance.weather,
      temperature: circumstance.temperature,
      moon_phase: circumstance.moonPhase,
      global_event: circumstance.globalEvent,
      notes: circumstance.notes
    };
  }

  static toDomainArray(dtos) {
    return dtos.map(dto => this.toDomain(dto));
  }
}