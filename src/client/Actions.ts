import { GuildMember } from 'discord.js';
import EsxBot from './EsxBot';

export class Actions {
  private EsxBot: EsxBot;

  constructor(EsxBot: EsxBot) {
    this.EsxBot = EsxBot;
  }

  public async warn(member: GuildMember, duration?: number, reason?: string) {
    this.EsxBot.managers.warn.add(member, reason);
    /* Possibly do more things on warn, log, etc.. */
  }

  public async ban(member: GuildMember, duration?: number, reason?: string) {
    this.EsxBot.managers.ban.add(member, duration, reason);
    /* Possibly do more things on ban, log, etc.. */
  }
}
