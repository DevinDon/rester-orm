import { logger } from '@iinfinity/logger';
import { Db, MongoClient } from 'mongodb';
import { MetadataKey } from '../constants';
import { ColumnConfig, EntityConfig } from '../decorators';
import { EntityInjector } from './injector';
import { DEFAULT_ORMCONFIG, ResterORMConfig } from './orm.config';

export interface ResterORMConnection {
  name: string;
  client: MongoClient;
  database: Db;
}

export class ResterORM {

  public readonly configs: ResterORMConfig[] = [];
  public connections: ResterORMConnection[] = [];

  constructor(configs: ResterORMConfig[]) {
    this.configs = configs
      .map(config => Object.assign({}, DEFAULT_ORMCONFIG, config));
    this.configs
      .forEach(config => config.entities = config.entities ?? []);
  }

  private async init() {
    this.configs.forEach(({ database: name, entities }) => {
      entities
        .forEach(async entity => {
          // get database
          const { database } = this.connections.find(connection => connection.name === name) || {};
          if (!database) {
            throw new Error(`Connection with database ${name} not exist.`);
          }
          // get collection config & create
          const { name: collection, ...entityConfig }: EntityConfig = Reflect.getMetadata(MetadataKey.Entity, entity);
          await database.collection(collection)
            .dropIndexes()
            .catch(error => logger.warn(`Collection ${collection} drop indexes failed, detail:`, error));
          await database.collection(collection)
            .drop()
            .catch(error => logger.warn(`Collection ${collection} drop failed, detail:`, error));
          await database.createCollection(collection, entityConfig)
            .catch(error => logger.warn(`Collection ${collection} create failed, detail:`, error));
          // get column config & create
          const columnConfigs: ColumnConfig[] = Reflect.getMetadata(MetadataKey.Column, entity);
          for await (const { name: column, index, unique } of columnConfigs) {
            index && await database.collection(collection)
              .createIndex({ [column]: 1 }, { unique })
              .catch(error => logger.warn(`Collection ${collection} create index ${column} failed, detail:`, error));
          }
          // inject instance
          EntityInjector.inject(entity).collection = database.collection(collection);
        });
    });
  }

  async bootstrap() {
    const clients = this.configs
      .map(({ username, password, host, port, database, authSource }) => ({
        name: database,
        client: new MongoClient(
          `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`,
          { useUnifiedTopology: true },
        ),
        database,
      }));
    await Promise.all(clients.map(({ client }) => client.connect()));
    this.connections = clients
      .map(({ name, client, database }) => ({
        name,
        client,
        database: client.db(database),
      }));
    await this.init();
    return this.connections;
  }

  async shutdown(force: boolean = false) {
    this.connections.forEach(({ client }) => client.close(force));
  }

}
