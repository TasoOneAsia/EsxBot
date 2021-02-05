import { GuildMember } from 'discord.js';
import EsxBot from './EsxBot';

export class Actions {
  private EsxBot: EsxBot;

  constructor(EsxBot: EsxBot) {
    this.EsxBot = EsxBot;
  }

  public async warn(
    member: GuildMember,
    duration?: number,
    reason?: string
  ): Promise<void> {
    this.EsxBot.managers.warn.add(member, reason);
    /* Possibly do more things on warn, log, etc.. */
  }

  public async ban(
    member: GuildMember,
    duration: number,
    staff?: string,
    reason?: string
  ): Promise<void> {
    this.EsxBot.managers.ban.add(member, duration, staff, reason);
    /* Possibly do more things on ban, log, etc.. */
  }
}
