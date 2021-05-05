import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { GuildMember, Message } from 'discord.js';
import { makeSimpleEmbed } from '../../utils';

export default class MuteCommand extends Command {
  private _logger: Logger;

  constructor(handler: CommandHandler) {
    super('unmute', {
      aliases: ['unmute'],
      description: {
        content: 'Unmutes a user and asks what role to give back',
        usage: 'mute [user] <reason>',
        examples: ['unmute @Taso newbie', 'unmute @Taso developer'],
      },
      category: 'Moderation',
      userPermissions: 'BAN_MEMBERS',
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author}, provide a valid member to unmute`,
            retry: (msg: Message) =>
              `${msg.author}, that member was not resolved. Please try again`,
          },
        },
        {
          id: 'role',
          type: ['newbie', 'developer'],
          match: 'rest',
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid role to set (newbie, developer)`,
            retry: (msg: Message) => `${msg.author}, invalid role (newbie, developer)`,
          },
        },
      ],
    });
    this._logger = handler.client.log.getChildLogger({
      name: 'UnmuteCmd',
      prefix: ['[UnmuteCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { member, role }: { member: GuildMember; role: 'newbie' | 'developer' }
  ): Promise<Message> {
    await this.client._actions.unmuteUser(member, role);

    return msg.channel.send(makeSimpleEmbed(`${member} was unmuted!`));
  }
}
