import { GuildMember, MessageEmbed, TextChannel, User } from 'discord.js';
import EsxBot from './EsxBot';
import { BanManager, WarnManager } from './managers';
import { Logger } from 'tslog';
import { actionMessageEmbed, modActionEmbed } from '../utils';
import { Repository } from 'typeorm';
import Infractions from '../models/Infractions';

export class Actions {
  private client: EsxBot;
  private readonly _logger: Logger;

  constructor(EsxBot: EsxBot) {
    this.client = EsxBot;

    this._logger = this.client.log.getChildLogger({
      name: 'ActionsLogger',
    });
  }

  public async warn(member: GuildMember, staff: User, reason: string): Promise<void> {
    this._logger.debug(`Warning user ${member.id}`);
    const actionEmbed = actionMessageEmbed({
      action: 'warn',
      reason,
      logger: this._logger,
      member,
      staffMember: staff,
    });

    await (<WarnManager>this.client.managerHandler.modules.get('warn')).add(
      member,
      staff.id,
      reason
    );

    member
      .send(actionEmbed)
      .catch((e) => this._logger.error('Could not send DM to member', e));

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

  public async muteUser(
    member: GuildMember,
    staffMember: User,
    reason: string
  ): Promise<void> {
    const infractsRepo: Repository<Infractions> = this.client.db.getRepository(
      Infractions
    );

    await infractsRepo.insert({
      user: member.id,
      reason: reason,
      infractionType: 'mute',
      guildId: member.guild.id,
      staffMember: staffMember.id,
    });

    this._logger.debug(`Added mute infraction for ${member.id}`);

    const mutedRole = member.guild.roles.cache.get(<string>process.env.MUTE_ROLE_ID);

    const dmEmbed = actionMessageEmbed({
      action: 'mute',
      reason,
      logger: this._logger,
      member,
      staffMember,
    });

    const modLogEmbed = modActionEmbed({
      action: 'mute',
      reason,
      logger: this._logger,
      member,
      staffMember,
    });

    await this.sendToModLog(modLogEmbed);

    // Send DM before mute
    member
      .send(dmEmbed)
      .catch((e) =>
        this._logger.error(`Could not send direct message to ${member.user.tag}`, e)
      );

    if (mutedRole) {
      await member.roles.set([mutedRole], reason);
      this._logger.debug(`Applied muted role to ${member.user.tag}`);
    }
  }
}
