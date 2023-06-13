import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { MarkerService } from './marker.service';
import { MarkerController } from './marker.controller';
import { MarkerMapperService } from './utils/marker-mapper.service';

@Module({
  imports: [PersistenceModule],
  controllers: [MarkerController],
  providers: [MarkerService, MarkerMapperService],
})
export class MarkerModule {}
