import { MeasurementsRepository } from '../repositories/MeasurementsRepository';
import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class MeasurementsService {
  private measurementsRepo: MeasurementsRepository;
  private nodesRepo: NodesRepository;

  constructor(pool: Pool) {
    this.measurementsRepo = new MeasurementsRepository(pool);
    this.nodesRepo = new NodesRepository(pool);
  }

  async createMeasurement(nodeId: string, userId: number, input: { measurement_id: number; value_integer?: number; value_decimal?: number; value_boolean?: boolean; value_text?: string; unit?: string }) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }

    const valueCount = [input.value_integer, input.value_decimal, input.value_boolean, input.value_text].filter(v => v !== undefined && v !== null).length;
    if (valueCount !== 1) {
      throw new ValidationError('Exactly one value field must be provided');
    }

    return this.measurementsRepo.create(nodeId, input);
  }

  async getMeasurements(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    return this.measurementsRepo.findByNodeId(nodeId);
  }

  async deleteMeasurements(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    const count = await this.measurementsRepo.deleteByNodeId(nodeId);
    return { removed: count };
  }
}