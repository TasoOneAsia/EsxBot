import { ConnectionManager } from 'typeorm';
import Infracts from '../models/Infractions';
import GuildSettings from '../models/GuildSettings';

const connectManager = new ConnectionManager();

connectManager.create({
  type: 'postgres',
  name: process.env.DB_NAME || 'EsxBot',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(<string>process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'EsxBot',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [Infracts, GuildSettings],
  synchronize: true,
});

export default connectManager;
