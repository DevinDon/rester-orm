import { Level } from '@rester/logger';
import { isProd } from '../utils';
import { BaseEntity } from './base.entity';

export interface ResterORMConfig {
  type?: 'mongodb';
  host?: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  logger?: Level;
  authSource?: string;
  sync?: boolean;
  entities: typeof BaseEntity[];
}

export const DEFAULT_ORMCONFIG: Partial<ResterORMConfig> = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  logger: isProd() ? Level.INFO : Level.ALL,
  authSource: 'admin',
  sync: !isProd(),
};
