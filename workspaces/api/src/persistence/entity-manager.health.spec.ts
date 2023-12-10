import { describe, expect, it, vi } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { EntityManagerService } from './entity-manager.service';
import { EntityManagerHealthIndicator } from './entity-manager.health';

describe('EntityManagerHealthIndicator', () => {
  const em = {
    isHealthy: vi.fn(),
  } as unknown as EntityManagerService;
  const healthIndicator = new EntityManagerHealthIndicator(em);

  describe('isHealthy', () => {
    it('should be true', async () => {
      vi.spyOn(em, 'isHealthy').mockReturnValue(new Promise<boolean>((resolve) => resolve(true)));

      const actual = await healthIndicator.isHealthy('test');

      expect(actual).toBeDefined();
      expect(actual['test']).toBeDefined();
      expect(actual['test']['status']).toBe('up');
    });

    it('should throw error if non-healthy', async () => {
      const expectedError = new HealthCheckError('EntityManager health check failed', null);
      let errorWasTriggered = false;
      vi.spyOn(em, 'isHealthy').mockReturnValue(new Promise<boolean>((resolve) => resolve(false)));

      try {
        await healthIndicator.isHealthy('test');
      } catch (error) {
        expect(error.toString()).toBe(expectedError.toString());
        errorWasTriggered = true;
      }

      expect(errorWasTriggered).toBe(true);
    });
  });
});
