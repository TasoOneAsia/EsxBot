import { Command, CommandHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger } from 'tslog';
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

    await this.client._actions.warn(member, msgAuthor.user, reason);

    const modEmbed = modActionEmbed({
      member: member,
      staffMember: msg.author,
      action: 'warn',
      reason,
      logger: this._logger,
    });

    await this.client._actions.sendToModLog(modEmbed);
    msg
      .delete({ timeout: 3000 })
      .catch((e) => this._logger.error('Could not delete message', e));

    return msg.channel.send(
      makeSimpleEmbed(`${member}, **has been warned.** (Reason: \`${reason}\`)`)
    );
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
