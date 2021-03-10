import 'dotenv/config';
import 'reflect-metadata';

import EsxBot from './client/EsxBot';

const bot: EsxBot = new EsxBot();

bot.start();
