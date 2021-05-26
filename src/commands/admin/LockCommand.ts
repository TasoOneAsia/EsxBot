import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, TextChannel } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';
import { isAdminOrOwner } from '../../structures/permResolvers';

export const OverwriteBackup = new Map();

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
      channel: 'guild',
      userPermissions: (msg: Message) => isAdminOrOwner(msg, handler),
      category: 'Admin',
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

    if (OverwriteBackup.get(msg.channel.id)) {
      return LockCommand._sendErrorMessage(msg, 'Channel is already locked!');
    }

    const channel = msg.channel as TextChannel;
    OverwriteBackup.set(msg.channel.id, channel.permissionOverwrites);

    msg.guild!.roles.cache.forEach((role) => {
      if (maxRole.position > role.position) {
        channel.updateOverwrite(role, { SEND_MESSAGES: false });
      }
    });

    return msg.channel.send(makeSimpleEmbed(`Channel is now locked!`));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
