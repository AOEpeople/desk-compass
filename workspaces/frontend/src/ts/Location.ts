import { getApiUrl } from './ApiUrl';
import type { ImageDimensions } from './ImageDimensions';

export type LocationDto = Omit<Location, 'markers'>;

export class Location {
  id: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  width: number;
  height: number;

  constructor(partial: Partial<Location>) {
    Object.assign(this, partial);
  }

  getDto(): LocationDto {
    return this as LocationDto;
  }

  getImageUrl(): string {
    return getApiUrl(`locations/${this.id}/image`).toString();
  }

  getDimensions(): ImageDimensions {
    return { width: this.width, height: this.height } as ImageDimensions;
  }
}
