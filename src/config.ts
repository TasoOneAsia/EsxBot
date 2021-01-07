//Debug Logging
import path from 'path';

export const BOT_TOKEN = process.env.BOT_TOKEN;

export const OWNER_IDS = ['188181246600282113', '292423857204363265'];

export const DEFAULT_PREFIX = '!';

// Logging Configs
export const LOG_TO_FILE = true;
export const LOG_VERBOSITY = 'debug';
export const LOG_OUTPUT_PATH = path.resolve('../logs');
