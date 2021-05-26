import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';
import { OverwriteBackup } from './LockCommand';
import { isAdminOrOwner } from '../../structures/permResolvers';

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
      channel: 'guild',
      userPermissions: (msg: Message) => isAdminOrOwner(msg, handler),
      category: 'Admin',
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'UnlockCmd',
      prefix: ['[UnlockCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message> {
    if (!OverwriteBackup.get(msg.channel.id)) {
      return UnlockCommand._sendErrorMessage(msg, 'Channel is not locked!');
    }

    if (msg.channel.type !== 'dm') {
      msg.channel.overwritePermissions(OverwriteBackup.get(msg.channel.id));
      OverwriteBackup.delete(msg.channel.id);
    }

    return msg.channel.send(makeSimpleEmbed(`Channel is now unlocked!`));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
