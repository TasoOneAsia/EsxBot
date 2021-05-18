import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';

const OverwriteBackup = new Map();
export { OverwriteBackup };

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
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'LockCmd',
      prefix: ['[LockCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message> {
    const lockRole = this.client.settings.get('lock-role');

    if (!lockRole) {
      return LockCommand._sendErrorMessage(msg, 'lock-role setting must be set!');
    }

    const maxRole = msg.guild!.roles.cache.get(lockRole);

    if (!maxRole) {
      return LockCommand._sendErrorMessage(msg, 'Max role was not found!');
    }

    msg.guild!.roles.cache.forEach((role) => {
      if (maxRole.position > role.position) {
        if (msg.channel.type !== 'dm') {
          OverwriteBackup.set(msg.channel.id, msg.channel.permissionOverwrites);
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
