import { GuildMember } from 'discord.js';
import EsxBot from './EsxBot';
import { BanManager, WarnManager } from './managers';

export class Actions {
  private EsxBot: EsxBot;

  constructor(EsxBot: EsxBot) {
    this.EsxBot = EsxBot;
  }

  public async warn(member: GuildMember, staff: string, reason?: string): Promise<void> {
    (<WarnManager>this.EsxBot.managerHandler.modules.get('warn')).add(
      member,
      staff,
      reason
    );
    /* Possibly do more things on warn, log, etc.. */
  }

  public async ban(
    member: GuildMember,
    duration: number,
    staff?: string,
    reason?: string
  ): Promise<void> {
    (<BanManager>this.EsxBot.managerHandler.modules.get('ban')).add(
      member,
      duration,
      staff,
      reason
    );
    //this.EsxBot.managers.ban.add(member, duration, staff, reason);
    /* Possibly do more things on ban, log, etc.. */
  }
}
