import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerModuleConfig } from './config/logger.config';
import { OpenTelemetryModuleConfig } from './config/otel.config';
import { HealthModule } from './health/health.module';
import { MarkerModule } from './marker/marker.module';
import { LocationModule } from './location/location.module';
import { PersistenceModule } from './persistence/persistence.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
    }),
    OpenTelemetryModuleConfig,
    LoggerModuleConfig,
    PersistenceModule,
    HealthModule,
    MarkerModule,
    LocationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
