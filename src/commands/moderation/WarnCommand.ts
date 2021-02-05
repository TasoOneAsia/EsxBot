import { Command, CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import Infractions from '../../models/Infractions';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import { modActionEmbed } from '../../utils/moderationUtils';
import { IModActionArgs } from '../../types';

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
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'othermembers',
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
  public async exec(
    msg: Message,
    { member, reason }: IModActionArgs
  ): Promise<Message | null> {
    try {
      if (!msg.guild) return null;

      const infractionsRepo: Repository<Infractions> = this.client.db.getRepository(
        Infractions
      );

      this.client._actions.warn(member, msg.author.id);
      this._logger.debug(`Member Resolved: ${member.id}`);

      const modEmbed = modActionEmbed({
        member: member,
        staffMember: msg.author,
        action: 'warn',
        reason,
        logger: this._logger,
      });

      await this._sendToModLog(modEmbed);
      msg.delete({ timeout: 3000 });
      return msg.channel.send(`${member}, **has been warned.** (Reason: \`${reason}\`)`);
    } catch (e) {
      this._logger.error(e);
      return msg.channel.send('Error has occurred');
    }
  }

  private async _sendToModLog(embed: MessageEmbed) {
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
