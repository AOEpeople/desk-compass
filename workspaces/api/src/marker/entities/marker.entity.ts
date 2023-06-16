import { Entity } from '../../persistence/entities/entity';
import { EntityType } from '../../persistence/entities/entity.type';

export class Marker extends Entity {
  static TYPE: EntityType = '/markers';

  lat: number;
  lng: number;
  name: string;
  image: string;
  type: string;
  icon: string;
  rotation: number;
  attributes: { [key: string]: string } = {};

  constructor(partial?: Partial<Marker>) {
    super();
    Object.assign(this, partial);
  }

  getType(): EntityType {
    return Marker.TYPE;
  }
}
