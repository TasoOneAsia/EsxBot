import { GuildMember } from 'discord.js';

export interface IModActionArgs {
  member: GuildMember;
  reason: string;
}

export interface GuildSettingsJSON {
  prefix: string;
  'basic-log-channel': string | null;
  'admin-log-channel': string | null;
  'rules-channel': string | null;
  'react-channel': string | null;
  'dev-role': string | null;
  'newbie-role': string | null;
  'mute-role': string | null;
}
