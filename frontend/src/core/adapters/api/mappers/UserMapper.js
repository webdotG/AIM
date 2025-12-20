export class UserMapper {
  static toDomain(dto) {
    if (!dto) return null;

    return {
      id: dto.id,
      email: dto.email,
      username: dto.username,
      firstName: dto.first_name,
      lastName: dto.last_name,
      avatar: dto.avatar,
      settings: dto.settings || {},
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  static toDTO(user) {
    return {
      email: user.email,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar: user.avatar,
      settings: user.settings
    };
  }
}