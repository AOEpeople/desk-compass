import { Entity } from '../../persistence/entities/entity';
import { EntityType } from '../../persistence/entities/entity.type';

export class Location extends Entity {
  static TYPE: EntityType = '/locations';

  name: string;
  shortName: string;
  description: string;
  image: string;
  width: number;
  height: number;

  constructor(partial?: Partial<Location>) {
    super();
    Object.assign(this, partial);
  }

  getType(): EntityType {
    return Location.TYPE;
  }
}
