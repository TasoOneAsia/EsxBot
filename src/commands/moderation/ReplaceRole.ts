import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';

interface IReplaceRoleArguments {
  removerole: Role;
  replacerole: Role;
}

export default class ReplaceRole extends Command {
  private log: Logger;
  public constructor(handler: CommandHandler) {
    super('replacerole', {
      aliases: ['replacerole'],
      description: {
        content: 'Replace a role with another one.',
        usage: 'replacerole <role.id> <role.id>',
        examples: ['replacerole 123123123222 243245342222'],
      },
      category: 'Moderation',
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'removerole',
          type: 'role',
          prompt: {
            start: 'Please provide the role to be replaced.',
          },
        },
        {
          id: 'replacerole',
          type: 'role',
          prompt: {
            start: 'Please provide the role that will replace the previous role.',
          },
        },
      ],
      channel: 'guild',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'ReplaceRoleCmd',
      prefix: ['ReplaceRoleCmd'],
    });
  }
  public async exec(
    msg: Message,
    { removerole, replacerole }: IReplaceRoleArguments
  ): Promise<Message | void> {
    msg
      .guild!.members.fetch()
      .then((members) => {
        return msg.reply(`fetched ${members.size} members`);
      })
      .catch((e) => console.log("Couldn't fetch members."));
  }
}
