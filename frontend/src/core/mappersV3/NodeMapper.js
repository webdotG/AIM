import { Node } from '../entitiesV3/Node';

export class NodeMapper {
  static toDomain(dto) {
    if (!dto) return null;
    return new Node(dto);
  }

  static toDomainArray(dtos) {
    if (!Array.isArray(dtos)) return [];
    return dtos.map(d => NodeMapper.toDomain(d));
  }

  static toDTO(node) {
    if (!node) return null;
    return {
      id: node.id,
      user_id: node.userId,
      node_type_code: node.nodeTypeCode,
      title: node.title,
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      deleted_at: node.deletedAt,
      emotions: node.emotions,
      tags: node.tags,
      measurement: node.measurement,
      edges: node.edges,
      analysis: node.analysis,
      images: node.images,
    };
  }
}