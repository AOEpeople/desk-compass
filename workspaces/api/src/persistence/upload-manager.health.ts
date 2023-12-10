import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { UploadManagerService } from './upload-manager.service';

@Injectable()
export class UploadManagerHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(UploadManagerService.PROVIDER)
    private readonly uploadManagerService: UploadManagerService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.uploadManagerService.isHealthy();
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('UploadManager health check failed', result);
  }
}
