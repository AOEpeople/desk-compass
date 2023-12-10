import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EntityManagerService } from './entity-manager.service';

@Injectable()
export class EntityManagerHealthIndicator extends HealthIndicator {
  constructor(private readonly entityManagerService: EntityManagerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.entityManagerService.isHealthy();
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('EntityManager health check failed', result);
  }
}
