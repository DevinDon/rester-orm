export interface PaginationParam<ID = string> {
  from?: ID;
  take?: number;
}

export interface Pagination<ID = string, Item = any> {
  next?: ID;
  list: Item[];
}

export { ObjectID } from 'mongodb';
