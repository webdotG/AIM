export class Circumstance {
  static create(data) {
    return {
      id: data.id,
      user_id: data.user_id,
      timestamp: data.timestamp,
      weather: data.weather,
      temperature: data.temperature,
      moon_phase: data.moon_phase,
      global_event: data.global_event,
      notes: data.notes,
      created_at: data.created_at,
    };
  }
}
