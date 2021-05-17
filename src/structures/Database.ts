import { ConnectionManager } from 'typeorm';
import path from 'path';

const connectManager = new ConnectionManager();

const modelsPath = path.join(__dirname, '..', 'models', '**', '*');

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
  entities: [modelsPath],
});

export default connectManager;
