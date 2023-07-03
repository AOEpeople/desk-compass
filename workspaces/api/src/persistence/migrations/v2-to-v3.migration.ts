import { Injectable } from '@nestjs/common';
import { Migration } from './migration';
import { Discover } from '../../registry/discover.decorator';

@Injectable()
@Discover('migration')
export class V2ToV3Migration extends Migration {
  version(): number {
    return 3;
  }

  isApplicable(jsonContent: string): boolean {
    const obj = JSON.parse(jsonContent);
    return !!(obj && obj['version'] && obj['version'] === 2);
  }

  getTransformation(): string {
    const markers = 'markers: .markers';
    const newLocProps = `{"name": "Home", "shortName": "H", "description": "", ${markers} }`;
    return `{ ${markers}, locations: .locations, version: ${this.version()} } | .locations[] += ${newLocProps} | del(.markers)`;
  }
}
