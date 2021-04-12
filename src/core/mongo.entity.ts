import { Collection, ObjectID } from 'mongodb';
import { Pagination, PaginationParam } from '../interfaces';
import { BaseEntity } from './base.entity';

export class MongoEntity<Model> extends BaseEntity {

  collection: Collection<Model>;

  async getPagination({ from = '000000000000000000000000', take = 10 }: PaginationParam<string> = {}): Promise<Pagination<string, Model>> {
    const list = await (this.collection as any).find({
      _id: { $gte: new ObjectID(from) },
    }, {
      limit: take + 1,
    }).toArray();
    if (list.length === take + 1) {
      return { next: list[list.length - 1]._id, list: list.slice(0, take) };
    }
    return { list };
  }

}
