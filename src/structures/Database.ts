import { ConnectionManager } from 'typeorm';
import Infracts from '../models/Infractions';
import GuildSettings from '../models/GuildSettings';

const connectManager = new ConnectionManager();

export const connectionName =
  process.env.NODE_ENV === 'development' ? 'dev_esxbot' : 'esxbot';

connectManager.create({
  type: 'postgres',
  host: 'localhost',
  name: connectionName,
  port: <number>(<unknown>process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME,
  entities: [Infracts, GuildSettings],
});

export default connectManager;
