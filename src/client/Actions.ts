import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import EsxBot from './EsxBot';
import { BanManager, WarnManager } from './managers';
import { Logger } from 'tslog';

export class Actions {
  private client: EsxBot;
  private readonly _logger: Logger;

  constructor(EsxBot: EsxBot) {
    this.client = EsxBot;

    this._logger = this.client.log.getChildLogger({
      name: 'ActionsLogger',
    });
  }

  public async warn(member: GuildMember, staff: string, reason?: string): Promise<void> {
    await (<WarnManager>this.client.managerHandler.modules.get('warn')).add(
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
    await (<BanManager>this.client.managerHandler.modules.get('ban')).add(
      member,
      duration,
      staff,
      reason
    );
    //this.EsxBot.managers.ban.add(member, duration, staff, reason);
    /* Possibly do more things on ban, log, etc.. */
  }

  /* TODO: We should propably move all mod & dm logs in a manager */
  public async sendToModLog(embed: MessageEmbed): Promise<void> {
    if (!process.env.ADMIN_LOG_CHANNEL_ID)
      throw new Error('ADMIN_LOG_CHANNEL_ID Env variable not defined');

    const channel = this.client.channels.cache.get(
      <string>process.env.ADMIN_LOG_CHANNEL_ID
    ) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this._logger.error(e);
    }
  }
}
