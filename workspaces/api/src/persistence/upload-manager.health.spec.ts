import { describe, expect, it, vi } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { UploadManagerService } from './upload-manager.service';
import { UploadManagerHealthIndicator } from './upload-manager.health';

describe('UploadManagerHealthIndicator', () => {
  const uploadManagerService = {
    isHealthy: vi.fn(),
  } as unknown as UploadManagerService;
  const healthIndicator = new UploadManagerHealthIndicator(uploadManagerService);

  describe('isHealthy', () => {
    it('should be true', async () => {
      vi.spyOn(uploadManagerService, 'isHealthy').mockReturnValue(new Promise<boolean>((resolve) => resolve(true)));

      const actual = await healthIndicator.isHealthy('test');

      expect(actual).toBeDefined();
      expect(actual['test']).toBeDefined();
      expect(actual['test']['status']).toBe('up');
    });

    it('should throw error if non-healthy', async () => {
      const expectedError = new HealthCheckError('UploadManager health check failed', null);
      let errorWasTriggered = false;
      vi.spyOn(uploadManagerService, 'isHealthy').mockReturnValue(new Promise<boolean>((resolve) => resolve(false)));

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
