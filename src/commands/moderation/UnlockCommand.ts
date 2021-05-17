import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';
import { LOCK_MAXROLE } from '../../config';
import { RoleManager } from 'discord.js';

export default class UnlockCommand extends Command {
  private _logger: Logger;

  constructor(handler: CommandHandler) {
    super('unlock', {
      aliases: ['unlock'],
      description: {
        content: 'Unlocks the channel',
        usage: 'unlock',
        examples: ['unlock'],
      },
      category: 'Moderation',
      userPermissions: 'KICK_MEMBERS',
      channel: 'guild',
      args: [],
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'UnlockCmd',
      prefix: ['[UnlockCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message> {
    const maxRole = msg.guild!.roles.cache.get(LOCK_MAXROLE);

    if (maxRole === undefined) {
      return UnlockCommand._sendErrorMessage(msg, 'Max role was not found!');
    }

    msg.guild!.roles.cache.forEach((role) => {
      if (maxRole.position > role.position) {
        if (msg.channel.type !== 'dm') {
          msg.channel.updateOverwrite(role, { SEND_MESSAGES: true });
        }
      }
    });

    return msg.channel.send(makeSimpleEmbed(`Channel is now unlocked!`));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
