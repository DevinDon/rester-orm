import { Pagination, PaginationParam } from '../interfaces';

export class BaseEntity {

  async getPagination({ from, take }: PaginationParam): Promise<Pagination> {
    throw new Error('Method not implemented.');
  }

}
