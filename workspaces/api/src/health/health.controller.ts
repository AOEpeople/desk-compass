import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { EntityManagerHealthIndicator } from '../persistence/entity-manager.health';
import { UploadManagerHealthIndicator } from '../persistence/upload-manager.health';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private entityManagerHealthIndicator: EntityManagerHealthIndicator,
    private uploadManagerHealthIndicator: UploadManagerHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.entityManagerHealthIndicator.isHealthy('entityManager'),
      () => this.uploadManagerHealthIndicator.isHealthy('uploadManager'),
    ]);
  }
}
