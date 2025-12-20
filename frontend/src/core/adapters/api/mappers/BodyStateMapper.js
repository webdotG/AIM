export class BodyStateMapper {
  static toDomain(dto) {
    if (!dto) return null;

    return {
      id: dto.id,
      userId: dto.user_id,
      timestamp: new Date(dto.timestamp),
      locationPoint: dto.location_point,
      locationName: dto.location_name,
      locationAddress: dto.location_address,
      locationPrecision: dto.location_precision,
      healthPoints: dto.health_points,
      energyPoints: dto.energy_points,
      circumstanceId: dto.circumstance_id,
      createdAt: new Date(dto.created_at)
    };
  }

  static toDTO(bodyState) {
    return {
      timestamp: bodyState.timestamp?.toISOString(),
      location_point: bodyState.locationPoint,
      location_name: bodyState.locationName,
      location_address: bodyState.locationAddress,
      location_precision: bodyState.locationPrecision,
      health_points: bodyState.healthPoints,
      energy_points: bodyState.energyPoints,
      circumstance_id: bodyState.circumstanceId
    };
  }

  static toDomainArray(dtos) {
    return dtos.map(dto => this.toDomain(dto));
  }
}