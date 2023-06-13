import { EntityType } from './entity.type';

export abstract class Entity {
  id: string;

  abstract getType(): EntityType;
}
