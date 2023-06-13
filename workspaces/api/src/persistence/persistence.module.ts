import { Module } from '@nestjs/common';
import { EntityManagerService } from './entity-manager.service';
import { UploadManagerService } from './upload-manager.service';
import { ConfigService } from '@nestjs/config';
import { EntityManagerHealthIndicator } from './entity-manager.health';
import { UploadManagerHealthIndicator } from './upload-manager.health';

const entityManagerProvider = {
  provide: EntityManagerService.PROVIDER,
  inject: [ConfigService],
  async useFactory(
    configService: ConfigService,
  ): Promise<EntityManagerService> {
    const db = await EntityManagerService.init(configService);
    return new EntityManagerService(db);
  },
};

const uploadManagerProvider = {
  provide: UploadManagerService.PROVIDER,
  inject: [ConfigService],
  async useFactory(
    configService: ConfigService,
  ): Promise<UploadManagerService> {
    const storage = await UploadManagerService.init(configService);
    return new UploadManagerService(storage);
  },
};

@Module({
  providers: [
    entityManagerProvider,
    uploadManagerProvider,
    EntityManagerHealthIndicator,
    UploadManagerHealthIndicator,
  ],
  exports: [
    EntityManagerService.PROVIDER,
    UploadManagerService.PROVIDER,
    EntityManagerHealthIndicator,
    UploadManagerHealthIndicator,
  ],
})
export class PersistenceModule {}
