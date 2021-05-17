import path from 'path';

/*
 * Misc Bot Settings
 */

export const GuildInteractSettings = [
  'prefix',
  'mod-log-channel',
  'admin-log-channel',
  'rules-channel',
  'react-channel',
  'dev-role',
  'noob-role',
  'mute-role',
];

// Bot Owner ID's
export const OWNER_IDS = [
  '188181246600282113',
  '292423857204363265',
  '511108466056626188',
];

export const IGNORED_CHANNELS = [
  '733029369324240987',
  '530362608394567680',
  '702452622371848213',
];

// The react emoji for the `newbie` role
export const NEWBIE_ROLE_EMOTE = '🤯';

// The react emoji for the `developer` role
export const DEVELOPER_ROLE_EMOTE = '😀';

/*
 * Logging Config Options
 */

// Log to file
export const LOG_TO_FILE = true;
// Log out verbosity
export const LOG_VERBOSITY = 'info';
// Will automatically log to `root_directory/logs`
export const LOG_OUTPUT_PATH = path.resolve('logs');

/*
 *  FILTER OPTIONS
 */

// Will automatically create an array of roles that bypass filters for messages from .env
export const FILTER_WHITELIST_ROLES = (<string>process.env.FILTER_WHITE_LIST_ROLES).split(
  ','
);
// Messages containing these word will automatically be deleted
export const BLACKLISTED_WORDS = ['zipperhead', 'nigger', 'nigga'];

/*
 * CommandHandler settings
 */
export const DEFAULT_COOLDOWN = 9000;

export const MagicEightBallResps = [
  `It is certain`,
  `It is decidedly so`,
  `Without a doubt`,
  `Yes, definitely`,
  `You may rely on it`,
  `As I see it, yes`,
  `Most likely`,
  `Outlook good`,
  `Signs point to yes`,
  `Yes`,
  `Reply hazy, try again`,
  `Ask again later`,
  `Better not tell you now`,
  `Cannot predict now`,
  `Concentrate and ask again`,
  `Don't bet on it`,
  `My reply is no`,
  `My sources say no`,
  `Outlook not so good`,
  `Very doubtful`,
];
