import { Collection } from 'mongodb';
import { BaseEntity } from './base.entity';

export class MongoEntity<Model = any> extends BaseEntity {

  collection: Collection<Model>;

}
