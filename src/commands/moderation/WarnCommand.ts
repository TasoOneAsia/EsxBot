import { Command, CommandHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger } from 'tslog';
import { Repository } from 'typeorm';
import { makeSimpleEmbed, modActionEmbed } from '../../utils';
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
  public async exec(msg: Message, { member, reason }: IModActionArgs): Promise<Message> {
    const msgAuthor = await msg.guild!.members.fetch(msg.author);

    if (member.roles.highest.position >= msgAuthor.roles.highest.position)
      return WarnCommand._sendErrorMessage(
        msg,
        'This was not allowed due to role hierachy'
      );

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
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
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
