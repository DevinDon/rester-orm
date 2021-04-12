import { logger } from '@rester/logger';
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
    for await (const { database: name, entities, sync, backup } of this.configs) {
      const tasks = entities.map(async entity => {
        // get database
        const { database } = this.connections.find(connection => connection.name === name) || {};
        if (!database) {
          throw new Error(`Connection with database ${name} not exist.`);
        }
        // get collection name & config
        const { name: collection, ...entityConfig }: EntityConfig = Reflect.getMetadata(MetadataKey.Entity, entity);
        // get collection config & create
        if (sync) {
          if (backup) {
            // backup previous collection
            await database.collection(collection).rename(`${collection}-backup-${Date.now()}`)
              .catch(error => logger.debug(`Collection ${collection} backup failed, maybe previous collection doesn't exist.`));
          } else {
            // or drop indexes
            await database.collection(collection).dropIndexes()
              .catch(error => logger.debug(`Collection ${collection} drop indexes failed, maybe previous collection doesn't exist.`));
          }
          // create collection
          await database.createCollection(collection, entityConfig)
            .catch(error => logger.warn(`Collection ${collection} create failed, detail:`, error));
          // get column config
          const columnConfigs: ColumnConfig[] = Reflect.getMetadata(MetadataKey.Column, entity);
          // create indexes
          for await (const { name: column, index, unique } of columnConfigs) {
            index && await database.collection(collection)
              .createIndex({ [column]: 1 }, { unique })
              .catch(error => logger.warn(`Collection ${collection} create index ${column} failed, detail:`, error));
          }
        }
        // inject instance
        EntityInjector.inject(entity).collection = database.collection(collection);
      });
      await Promise.all(tasks);
    }
  }

  /**
   * Startup Rester ORM, connect to database(s) & init database(s).
   */
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

  /**
   * Close all connections & shutdown Rester ORM.
   */
  async shutdown(force: boolean = false) {
    this.connections.forEach(({ client }) => client.close(force));
  }

}
