import { Edge } from '../entitiesV3/Edge';

export class EdgeMapper {
  static toDomain(dto) {
    if (!dto) return null;
    return new Edge(dto);
  }

  static toDomainArray(dtos) {
    if (!Array.isArray(dtos)) return [];
    return dtos.map(d => EdgeMapper.toDomain(d));
  }
}