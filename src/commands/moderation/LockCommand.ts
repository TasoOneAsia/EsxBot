import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';
import { LockMaxRole } from '../../config';

export default class LockCommand extends Command {
  private _logger: Logger;

  constructor(handler: CommandHandler) {
    super('lock', {
      aliases: ['lock'],
      description: {
        content: 'Locks the channel',
        usage: 'lock',
        examples: ['lock'],
      },
      category: 'Moderation',
      userPermissions: 'KICK_MEMBERS',
      channel: 'guild',
      args: [],
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'LockCmd',
      prefix: ['[LockCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message> {
    const maxRole = msg.guild!.roles.cache.get(LockMaxRole);

    if (maxRole === undefined) {
      return LockCommand._sendErrorMessage(msg, 'Max role was not found!');
    }

    msg.guild!.roles.cache.forEach((role) => {
      if (maxRole.position > role.position) {
        if (msg.channel.type !== 'dm') {
          msg.channel.updateOverwrite(role, { SEND_MESSAGES: false });
        }
      }
    });

    return msg.channel.send(makeSimpleEmbed(`Channel is now locked!`));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
