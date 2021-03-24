import { MetadataKey } from '../constants';

export interface EntityConfig {

  /** database name */
  name: string;

  /** is fixed collection */
  capped?: boolean;

  /** max byte size of fixed collection */
  size?: number;

  /** maximum number of documents */
  max?: number;

}

export const Entity = ({ name, ...config }: Partial<EntityConfig> = {}): ClassDecorator => target => {
  Reflect.defineMetadata(MetadataKey.Entity, { name: name ?? target.name, ...config }, target);
};
