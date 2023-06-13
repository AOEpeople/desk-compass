import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [TerminusModule, PersistenceModule],
  controllers: [HealthController],
})
export class HealthModule {}
