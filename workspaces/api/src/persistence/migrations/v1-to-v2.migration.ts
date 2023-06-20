import { Injectable } from '@nestjs/common';
import * as uuid from '@lukeed/uuid';
import { Discover } from '../../registry/discover.decorator';
import { Migration } from './migration';

@Injectable()
@Discover('migration')
export class V1ToV2Migration extends Migration {
  version(): number {
    return 2;
  }

  isApplicable(jsonContent: string): boolean {
    const obj = JSON.parse(jsonContent);
    return !!(obj && obj['marker'] && obj['bgFloorplan'] && !obj['version']);
  }

  getTransformation(): string {
    const newUuid = uuid.v4();
    const markers = 'markers: .marker';
    const locations = `locations: { "${newUuid}": { id: "${newUuid}", image: .bgFloorplan.image, width: .bgFloorplan.width, height: .bgFloorplan.height } }`;
    return `{ ${markers}, ${locations}, version: ${this.version()} }`;
  }
}
