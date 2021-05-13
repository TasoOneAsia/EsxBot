import { GuildMember } from 'discord.js';

export interface IModActionArgs {
  member: GuildMember;
  reason: string;
}

export interface IM8bArgs {
  question: string;
}
