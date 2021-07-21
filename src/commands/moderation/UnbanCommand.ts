import { Argument, Command, CommandHandler } from 'discord-akairo';
import { Message, User } from 'discord.js';
import { Logger } from 'tslog';
import { makeSimpleEmbed } from '../../utils';
import { BanManager } from '../../client/managers';

export default class UnbanCommand extends Command {
  private log: Logger;

  constructor(handler: CommandHandler) {
    super('unban-cmd', {
      channel: 'guild',
      description: {
        content:
          'Unbans a user using their user ID or if the user is still in cache, their username',
        usage: 'unban <userid>',
        examples: ['unban 188181246600282113'],
      },
      category: 'Moderation',
      userPermissions: ['BAN_MEMBERS'],
      aliases: ['unban', 'ub'],
      args: [
        {
          id: 'user',
          type: Argument.union('user', 'string'),
          prompt: {
            start: 'Please provide a user to unban',
            retry: 'That user was not resolved, please use the ID',
          },
        },
        {
          id: 'reason',
          default: 'No reason provided',
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'UnbanCmd',
      prefix: ['[UnbanCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { user, reason }: { user: User | string; reason: string }
  ): Promise<Message> {
    const userId: string = user instanceof User ? user.id : user;

    this.log.debug(`UserID to unban: ${userId}`);

    const banModule = <BanManager>this.client.managerHandler.modules.get('ban');

    const logFormatReason = `${msg.author.tag} unbanned for "${reason}"`;
    const banRes = await banModule.unban(userId, logFormatReason);

    if (!banRes) {
      return await msg.channel.send(
        makeSimpleEmbed(
          'That user was not found in the database! Failing to unban',
          'RED'
        )
      );
    }

    const successEmbed = makeSimpleEmbed(`Unbanned <@${user}> for \`${reason}\``);
    return msg.channel.send(successEmbed);
  }
}
