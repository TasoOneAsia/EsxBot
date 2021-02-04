import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Repository } from 'typeorm';
import Infractions from '../../models/Infractions';
import { discordCodeBlock, parseTimeFromString } from '../../utils/miscUtils';
import dayjs from 'dayjs';
import { actionMessageEmbed, modActionEmbed } from '../../utils/moderationUtils';

interface IBanAction {
  member: GuildMember;
  reason: string;
  duration: string;
}

export default class BanCommand extends Command {
  private readonly _logger: Logger;

  constructor(handler: CommandHandler) {
    super('ban', {
      channel: 'guild',
      aliases: ['ban'],
      description: {
        content: 'Ban a guild member',
        usage: 'ban <user> [reason]',
        examples: ['ban @Taso noob', 'ban 188181246600282113 noob'],
      },
      category: 'Moderation',
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author}, provide a valid member to warn`,
            retry: (msg: Message) =>
              `${msg.author}, that member was not resolved. Please try again`,
          },
        },
        {
          id: 'duration',
          prompt: {
            start: (msg: Message) => `${msg.author}, please provide a duration`,
            retry: (msg: Message) => `${msg.author}, please provide a duration`,
          },
        },
        {
          id: 'reason',
          match: 'rest',
          default: 'No reason provided',
        },
      ],
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'BanCommand',
      prefix: ['[BanCommand]'],
    });
  }
  // TODO: Cleanup filth
  public async exec(
    msg: Message,
    { member, duration, reason }: IBanAction
  ): Promise<Message> {
    try {
      const infractionsRepo: Repository<Infractions> = this.client.db.getRepository(
        Infractions
      );

      msg.delete({ timeout: 3000 });

      if (duration === 'perma') {
        await infractionsRepo.insert({
          user: member.id,
          staffMember: msg.author.id,
          reason,
          unbanDate: 0,
          infractionType: 'ban',
        });

        const [dmEmbed, logEmbed] = this._buildEmbeds(
          msg,
          member,
          reason,
          'Permanently Banned'
        );

        try {
          member.send(dmEmbed);
        } catch (e) {
          this._logger.error(`Unable to send DM to ${member.user.username}`);
        }
        await this._sendToModLog(logEmbed);

        await member.ban({
          days: 1,
          reason,
        });

        return msg.channel.send(`**${member.user.tag}** was banned for **${reason}**`);
      }

      const parsedTime = parseTimeFromString(duration);

      if (!parsedTime) return msg.reply('Incorrect date format');

      const unbanDate = dayjs().add(parsedTime as number, 'ms');

      await infractionsRepo.insert({
        user: member.id,
        staffMember: msg.author.id,
        reason,
        unbanDate: unbanDate.unix(),
        infractionType: 'ban',
      });

      const [dmEmbed, logEmbed] = this._buildEmbeds(
        msg,
        member,
        reason,
        unbanDate.format('MM/DD/YY')
      );

      try {
        await member.send(dmEmbed);
      } catch (e) {
        this._logger.error(`Unable to send direct message to ${member.user.username}`);
      }

      await this._sendToModLog(logEmbed);

      await member.ban({
        days: 1,
        reason,
      });

      return msg.channel.send(unbanDate.format('MM/DD/YY') || 'Perma');
    } catch (e) {
      this._logger.error(e);
      return msg.channel.send('An internal error occured');
    }
  }

  private async _sendToModLog(embed: MessageEmbed) {
    if (!process.env.LOG_CHANNEL_ID)
      throw new Error('LOG_CHANNEL Env variable not defined');

    const channel = this.client.channels.cache.get(
      <string>process.env.LOG_CHANNEL_ID
    ) as TextChannel;
    try {
      await channel.send(embed);
    } catch (e) {
      this._logger.error(e);
    }
  }

  private _buildEmbeds(
    msg: Message,
    member: GuildMember,
    reason: string,
    unbanDate: string
  ): [MessageEmbed, MessageEmbed] {
    const dmEmbed = actionMessageEmbed({
      action: 'ban',
      staffMember: msg.author,
      logger: this._logger,
      member,
      reason,
      fields: [
        {
          name: 'Unban Date:',
          // value: `${discordCodeBlock(unbanDate.format('MM/DD/YY') || 'Perma')}`,
          value: `${discordCodeBlock(unbanDate)}`,
          inline: false,
        },
      ],
    });

    const logEmbed = modActionEmbed({
      action: 'ban',
      staffMember: msg.author,
      reason,
      member,
      logger: this._logger,
      fields: [
        {
          name: 'Unban Date:',
          value: `${discordCodeBlock(unbanDate)}`,
          inline: false,
        },
      ],
    });
    return [dmEmbed, logEmbed];
  }
}
