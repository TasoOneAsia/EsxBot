import { GuildMember, MessageEmbed, Role, TextChannel, User } from 'discord.js';
import EsxBot from './EsxBot';
import { BanManager, WarnManager } from './managers';
import { Logger } from 'tslog';
import { actionMessageEmbed, modActionEmbed } from '../utils';
import { Repository } from 'typeorm';
import Infractions from '../models/Infractions';

export interface AddBanData {
  member: GuildMember;
  duration: number | null;
  staff?: string;
  reason?: string;
}

export class Actions {
  private client: EsxBot;
  private readonly log: Logger;

  constructor(EsxBot: EsxBot) {
    this.client = EsxBot;

    this.log = this.client.log.getChildLogger({
      name: 'ActionsLogger',
    });
  }

  public async warn(member: GuildMember, staff: User, reason: string): Promise<void> {
    this.log.debug(`Warning user ${member.id}`);
    const actionEmbed = actionMessageEmbed({
      action: 'warn',
      reason,
      logger: this.log,
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
      .catch((e) => this.log.error('Could not send DM to member', e));

    /* Possibly do more things on warn, log, etc.. */
  }

  public async ban({ member, duration, staff, reason }: AddBanData): Promise<void> {
    await (<BanManager>this.client.managerHandler.modules.get('ban')).add({
      member,
      duration,
      staff,
      reason,
    });
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
      this.log.error(e);
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

    this.log.debug(`Added mute infraction for ${member.id}`);

    const mutedRole = member.guild.roles.cache.get(<string>process.env.MUTE_ROLE_ID);

    const dmEmbed = actionMessageEmbed({
      action: 'mute',
      reason,
      logger: this.log,
      member,
      staffMember,
    });

    const modLogEmbed = modActionEmbed({
      action: 'mute',
      reason,
      logger: this.log,
      member,
      staffMember,
    });

    await this.sendToModLog(modLogEmbed);

    // Send DM before mute
    member
      .send(dmEmbed)
      .catch((e) =>
        this.log.error(`Could not send direct message to ${member.user.tag}`, e)
      );

    if (mutedRole) {
      await member.roles.set([mutedRole], reason);
      this.log.debug(`Applied muted role to ${member.user.tag}`);
    }
  }

  unmuteUser(member: GuildMember, role: 'newbie' | 'developer'): void {
    const devRole = <Role>(
      member.guild.roles.cache.get(<string>process.env.DEVELOPER_ROLE_ID)
    );
    const newbieRole = <Role>(
      member.guild.roles.cache.get(<string>process.env.NEWBIE_ROLE_ID)
    );

    if (role === 'newbie') {
      member.roles
        .set([newbieRole])
        .catch((e) => this.log.error('Unable to set role to newbie', e));
    }

    if (role === 'developer') {
      member.roles
        .set([devRole])
        .catch((e) => this.log.error('Unable to set role to developer', e));
    }
  }
}
