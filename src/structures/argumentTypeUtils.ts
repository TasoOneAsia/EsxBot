import { Argument } from 'discord-akairo';
import { Message } from 'discord.js';
import { ResolvableSetSettingArgTypes } from '../commands/settings/SettingsCommandSet';
import { GuildSettingsJSON } from '../types';

export const prefixPromptType = Argument.compose(
  Argument.validate('string', (m, p, v) => v.length < 5),
  'lowercase'
);

export const setSettingsCommandTypeCaster = (
  msg: Message,
  p: string
): ResolvableSetSettingArgTypes => {
  switch (<keyof GuildSettingsJSON>p) {
    case 'prefix':
      return 'string';
    case 'react-channel':
      return 'textChannel';
    case 'admin-log-channel':
      return 'textChannel';
    case 'basic-log-channel':
      return 'textChannel';
    case 'newbie-role':
      return 'role';
    case 'mute-role':
      return 'role';
    case 'dev-role':
      return 'role';
    case 'rules-channel':
      return 'textChannel';
    case 'lock-role':
      return 'role';
  }
};

type GuildSettingToTypeMap = {
  [index in keyof GuildSettingsJSON]: string;
};

export const guildSettingToTypeMap: GuildSettingToTypeMap = {
  prefix: 'String (Not more than 4 Chars)',
  'mute-role': 'Role (ID or mention)',
  'basic-log-channel': 'TextChannel (ID or mention)',
  'newbie-role': 'Role (ID or mention)',
  'admin-log-channel': 'TextChannel (ID or mention)',
  'react-channel': 'TextChannel (ID or mention)',
  'dev-role': 'Role (ID or mention)',
  'rules-channel': 'TextChannel (ID or mention)',
  'lock-role': 'Role (ID or mention)',
};
