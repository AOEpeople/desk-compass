import { Inject, Injectable } from '@nestjs/common';
import { EntityManagerService } from './persistence/entity-manager.service';
import { UploadManagerService } from './persistence/upload-manager.service';
import { Location } from './location/entities/location.entity';
import { promises as p } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  private readonly floorPlanId = 'bgFloorplan';

  constructor(
    @Inject(EntityManagerService.PROVIDER)
    private readonly em: EntityManagerService,
    @Inject(UploadManagerService.PROVIDER)
    private readonly uploadManager: UploadManagerService,
  ) {}

  async getFloorPlan(): Promise<{
    image: Buffer;
    width: number;
    height: number;
  }> {
    let location;
    try {
      location = await this.em.get<Location>(Location.TYPE, this.floorPlanId);
    } catch (e) {
      location = await this.em.create<Location>(
        Location.TYPE,
        new Location({ id: this.floorPlanId }),
      );
    }

    if (!location.image) {
      // provide fallback
      const fallbackFilePath = join(__dirname, 'location/default.png');
      return {
        image: await p.readFile(fallbackFilePath),
        width: 1000,
        height: 1000,
      };
    }

    return {
      image: await this.uploadManager.get(location.image),
      width: location.width,
      height: location.height,
    };
  }

  async uploadFloorPlan(
    file: Express.Multer.File,
    width: number,
    height: number,
  ): Promise<string> {
    let location: Location = new Location({
      id: this.floorPlanId,
      width: width,
      height: height,
    });
    try {
      location = await this.em.get<Location>(Location.TYPE, this.floorPlanId);
    } catch (e) {
      location = await this.em.create<Location>(Location.TYPE, location);
    }
    const previousImageId = location.image;
    location.image = await this.uploadManager.upload(file);
    location.width = width;
    location.height = height;
    const updatedLocation = await this.em.update<Location>(
      Location.TYPE,
      location,
    );
    if (previousImageId) {
      await this.uploadManager.delete(previousImageId);
    }
    return updatedLocation.image;
  }
}
