import { MetadataKey } from '../constants';

export interface EntityConfig {

  /** database name */
  name?: string;

}

export const Entity = (config: EntityConfig = {}): ClassDecorator => target => {
  Reflect.defineMetadata(MetadataKey.Entity, config, target);
};
