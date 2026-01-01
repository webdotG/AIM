export class BodyState {
  static create(data) {
    return {
      id: data.id,
      user_id: data.user_id,
      timestamp: data.timestamp,
      location_point: data.location_point,
      location_name: data.location_name,
      health_points: data.health_points,
      energy_points: data.energy_points,
      circumstance_id: data.circumstance_id,
      created_at: data.created_at,
    };
  }
}
