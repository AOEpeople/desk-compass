import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthCheckService } from '@nestjs/terminus';
import { EntityManagerHealthIndicator } from '../persistence/entity-manager.health';
import { UploadManagerHealthIndicator } from '../persistence/upload-manager.health';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const healthCheckService: HealthCheckService = {
    check: vi.fn(),
  } as any as HealthCheckService;
  const entityManagerHealthIndicator: EntityManagerHealthIndicator = {
    isHealthy: vi.fn(),
  } as any as EntityManagerHealthIndicator;
  const uploadManagerHealthIndicator: UploadManagerHealthIndicator = {
    isHealthy: vi.fn(),
  } as any as UploadManagerHealthIndicator;

  beforeEach(async () => {
    controller = new HealthController(
      healthCheckService,
      entityManagerHealthIndicator,
      uploadManagerHealthIndicator,
    );
  });

  describe('check', () => {
    it('should run', () => {
      const actual = controller.check();

      expect(actual).toBeDefined();
    });
  });
});
