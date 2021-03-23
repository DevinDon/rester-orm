import { MetadataKey } from '../constants';
import { PropertyType } from '../interfaces';

export interface ColumnConfig {

  /** is index column */
  index?: boolean;

  /** is unique column */
  unique?: boolean;

}

export interface ColumnDeclaration {
  key: string | symbol;
  type: PropertyType;
  config: ColumnConfig;
}

export const Column = (config: ColumnConfig = {}): PropertyDecorator => (target, key) => {
  const type: PropertyType = Reflect.getMetadata('design:type', target, key).name;
  const exists: ColumnDeclaration[] = Reflect.getMetadata(MetadataKey.Column, target) ?? [];
  Reflect.defineMetadata(MetadataKey.Column, [...exists, { key, type, config }], target);
};
