import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';

export default class MuteCommand extends Command {
  private _logger: Logger;

  constructor(handler: CommandHandler) {
    super('mute', {
      aliases: ['mute', 'silence'],
      description: {
        content: 'Mutes a user by adding the muted role',
        usage: 'mute [user] <reason>',
        examples: ['mute @Taso Annoying', 'mute 188181246600282113 Bad coder'],
      },
      category: 'Moderation',
      userPermissions: 'BAN_MEMBERS',
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
      name: 'MuteCmd',
      prefix: ['[MuteCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    const msgAuthor = await msg.guild!.members.fetch(msg.author.id);

    if (msg.author.id === member.id)
      return MuteCommand._sendErrorMessage(msg, 'Cannot mute yourself');

    if (member.roles.highest.position >= msgAuthor.roles.highest.position)
      return MuteCommand._sendErrorMessage(
        msg,
        'This was not allowed due to role hierachy'
      );

    await this.client._actions.muteUser(member, msg.author, reason);

    return msg.channel.send(makeSimpleEmbed(`${member} was muted for \`${reason}\``));
  }

  private static async _sendErrorMessage(msg: Message, e: string): Promise<Message> {
    return await msg.channel.send(makeSimpleEmbed(`**Error**: ${e}`, 'RED'));
  }
}
