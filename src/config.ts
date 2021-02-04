import path from 'path';

/*
 * Misc Bot Settings
 */

// Bot Owner ID's
export const OWNER_IDS = [
  '188181246600282113',
  '292423857204363265',
  '662660857960071219',
];

// Default prefix
export const DEFAULT_PREFIX = '!';

// Rules Embed Template
export const RULES = [
  'Be cool, kind, and civil. Treat all members with respect.',
  'Do not spam (especially other discord servers). No self-promotion.',
  'No harassment, abuse, racism, sexism or otherwise offensive content.',
  'Do not tag/pm staff/support team. Use the proper channels.',
  `You are not allowed to use the #releases and #snippets channels, unless you're sharing something for free.`,
  'It is forbidden to sell resources in this Discord, this is not a script market.',
  `Don't expect us to hold your hand entirely - we can help you understand concepts and locate the correct resources, but not write your code for you.`,
  'No advertising (This includes your YouTube channel, Discord server, RP server, and your paid scripts.)',
  'No support for leaked/stolen/paid scripts. (Even if the creator sends you here, we will not provide support for their scripts)',
  'No support for cheating.',
  'Do not offer money for services of any kind.',
  'The #framework-support channel is for ESX Framework scripts only, not whatever random script you found online.',
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
export const BLACKLISTED_WORDS = ['zipperhead', 'idiot', 'moron'];

/*
 * CommandHandler settings
 */
export const DEFAULT_COOLDOWN = 9000;
