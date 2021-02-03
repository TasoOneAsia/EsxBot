import { Command, CommandHandler } from 'discord-akairo';
import { Message, GuildMember, MessageEmbed, TextChannel } from 'discord.js';

import Infractions from '../../models/Infractions';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import { modLogEmbed } from '../../utils/moderationUtils';

interface IWarnArgs {
  member: GuildMember;
  reason: string;
}

export default class WarnCommand extends Command {
  private readonly _logger: Logger;

  public constructor(handler: CommandHandler) {
    super('warn', {
      aliases: ['warn', 'strike'],
      category: 'Moderation',
      description: {
        content: 'Warn a member',
        usage: 'warn [member] <reason>',
        examples: ['warn @Taso Bad coder', 'warn 188181246600282113 Bad coder'],
      },
      userPermissions: ['KICK_MEMBERS'],
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
          id: 'reason',
          match: 'rest',
          default: 'No reason provided',
        },
      ],
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'WarnCommandLogger',
    });
  }
  public async exec(msg: Message, { member, reason }: IWarnArgs): Promise<Message> {
    try {
      const infractionsRepo: Repository<Infractions> = this.client.db.getRepository(
        Infractions
      );

      await infractionsRepo.insert({
        user: member.id,
        staffMember: msg.author.id,
        reason: reason,
        infractionType: 'warn',
      });

      this._logger.debug(`Member Resolved: ${member.id}`);

      const modEmbed = modLogEmbed({
        member: member,
        staffMember: msg.author,
        action: 'warn',
        reason,
        logger: this._logger,
      });

      await this._sendToModLog(modEmbed);

      return msg.channel.send(`${member}, **has been warned.** (Reason: \`${reason}\`)`);
    } catch (e) {
      this._logger.error(e);
      return msg.channel.send('Error has occurred');
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
}