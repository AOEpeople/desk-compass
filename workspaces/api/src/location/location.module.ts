import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { LocationMapperService } from './utils/location-mapper.service';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [LocationController],
  providers: [LocationService, LocationMapperService],
})
export class LocationModule {}
