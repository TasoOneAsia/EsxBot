import { ConnectionManager } from 'typeorm';
import Infracts from '../models/Infractions';
import GuildSettings from '../models/GuildSettings';
import path from 'path';

const connectManager = new ConnectionManager();

connectManager.create({
  type: 'sqlite',
  name: 'EsxBot',
  database: path.join(process.cwd(), 'esx.sqlite'),
  entities: [Infracts, GuildSettings],
});

export default connectManager;
