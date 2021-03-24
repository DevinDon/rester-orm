import { MetadataKey } from '../constants';
import { PropertyType } from '../interfaces';

export interface ColumnConfig {

  /** column name */
  name: string;

  /** column type */
  type: PropertyType;

  /** is index column */
  index?: boolean;

  /** is unique column */
  unique?: boolean;

}

export const Column = ({ ...config }: Partial<Omit<ColumnConfig, 'name' | 'type'>> = {}): PropertyDecorator => (target, key) => {
  const type: PropertyType = Reflect.getMetadata('design:type', target, key).name;
  const exists: ColumnConfig[] = Reflect.getMetadata(MetadataKey.Column, target.constructor) ?? [];
  Reflect.defineMetadata(MetadataKey.Column, [...exists, { name: key, type, ...config }], target.constructor);
};
