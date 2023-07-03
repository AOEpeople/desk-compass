import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RegistryModule } from '../registry/registry.module';
import { EntityManagerService } from './entity-manager.service';
import { UploadManagerService } from './upload-manager.service';
import { EntityManagerHealthIndicator } from './entity-manager.health';
import { UploadManagerHealthIndicator } from './upload-manager.health';
import { V1ToV2Migration } from './migrations/v1-to-v2.migration';
import { V2ToV3Migration } from './migrations/v2-to-v3.migration';
import { MigrationService } from './migrations/migration.service';

const uploadManagerProvider = {
  provide: UploadManagerService.PROVIDER,
  inject: [ConfigService],
  async useFactory(configService: ConfigService): Promise<UploadManagerService> {
    const storage = await UploadManagerService.init(configService);
    return new UploadManagerService(storage);
  },
};

@Module({
  imports: [ConfigModule, RegistryModule],
  providers: [
    V1ToV2Migration,
    V2ToV3Migration,
    MigrationService,
    EntityManagerService,
    uploadManagerProvider,
    EntityManagerHealthIndicator,
    UploadManagerHealthIndicator,
  ],
  exports: [EntityManagerService, UploadManagerService.PROVIDER, EntityManagerHealthIndicator, UploadManagerHealthIndicator],
})
export class PersistenceModule {}
