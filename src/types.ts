import { GuildMember } from 'discord.js';

export interface IModActionArgs {
  member: GuildMember;
  reason: string;
}
