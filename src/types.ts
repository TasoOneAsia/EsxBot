import { GuildMember } from 'discord.js';

export interface IModActionArgs {
  member: GuildMember;
  reason: string;
}

export type ModAction = 'warn' | 'kick' | 'ban';
