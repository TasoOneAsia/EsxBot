import { Message, MessageEmbed, Role, GuildMember } from 'discord.js';
import { ArgumentOptions, Command, CommandHandler, Flag } from 'discord-akairo';
import { convertNanoToMs, makeSimpleEmbed } from '../../utils';
import { Logger } from 'tslog';
import { isAdminOrOwner } from '../../structures/permResolvers';

interface IReplaceRoleArguments {
  membersWithRole: GuildMember[];
  removeRole: Role;
  replaceRole: Role;
  dry: Flag;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
      flags: ['--dry'],
      userPermissions: (msg: Message) => isAdminOrOwner(msg, handler),
      category: 'Admin',
      channel: 'guild',
    });

    this.log = handler.client.log.getChildLogger({
      name: 'ReplaceRoleCmd',
      prefix: ['ReplaceRoleCmd'],
    });
  }

  async *args(msg: Message): AsyncGenerator<ArgumentOptions> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const removeRole: Role = yield {
      type: 'role',
      prompt: {
        timeout: 0,
        start: () => `Provide the role you want to remove.`,
        retry: (msg: Message) => `${msg.author}, this is an invalid role try again`,
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const replaceRole: Role = yield {
      type: 'role',
      prompt: {
        timeout: 0,
        start: () => `Provide the role that will replace the previous one.`,
        retry: (msg: Message) => `${msg.author}, this is an invalid role try again`,
      },
    };

    const dry = yield {
      match: 'flag',
      flag: '--dry',
    };

    let membersWithRole: GuildMember[] = [];
    await msg
      .guild!.members.fetch()
      .then((members) => {
        membersWithRole = members.filter((u) => u.roles.cache.has(removeRole.id)).array();
      })
      .catch((e) => this.log.error(e));

    const confirmOptions = yield {
      type: ['confirm', 'exit'],
      prompt: {
        modifyStart: () => {
          const embed = new MessageEmbed()
            .setTitle(`Confirm replacerole ${dry ? '(--dry)' : ''}`)
            .setColor('GREEN')
            .setFooter('Type `CONFIRM` to confirm or `EXIT` to exit')
            .setDescription(`This will affect ${membersWithRole.length} members.`)
            .addFields(
              { name: 'Role to remove', value: `${removeRole.name}` },
              { name: 'Replacing with', value: `${replaceRole.name}` },
              {
                name: 'Estimated time',
                value: `${((membersWithRole.length * 100) / 1000).toFixed(2)} seconds.`,
              }
            );
          return { embed };
        },
        retry: (msg: Message) => `${msg.author}, this is an invalid option try again`,
      },
    };

    if (confirmOptions === 'exit') {
      await msg.channel.send(makeSimpleEmbed('Command cancelled!', 'GREEN'));
      return Flag.cancel();
    }

    return {
      membersWithRole,
      removeRole,
      replaceRole,
      dry,
    };
  }

  public async exec(
    msg: Message,
    { membersWithRole, removeRole, replaceRole, dry }: IReplaceRoleArguments
  ): Promise<Message | void> {
    if (dry) {
      return this.debug(msg, membersWithRole, removeRole, replaceRole);
    } else {
      return this.execute(msg, membersWithRole, removeRole, replaceRole);
    }
  }

  private async execute(
    msg: Message,
    membersWithRole: GuildMember[],
    removeRole: Role,
    replaceRole: Role
  ) {
    const startTime = process.hrtime.bigint();

    for (let i = 0; i < membersWithRole?.length; i++) {
      const user = membersWithRole[i];
      user.roles.remove(removeRole.id);
      this.log.debug(
        `replacerole: Removed ${removeRole.name} from user ${user.user.username}`
      );
      user.roles.add(replaceRole.id);
      this.log.debug(
        `replacerole: Added ${replaceRole.name} to user ${user.user.username}`
      );
      await timer(100);
    }

    const endTime = process.hrtime.bigint();
    const loadedInMS = convertNanoToMs(endTime - startTime);
    this.log.debug(
      `replacerole: Replaced ${removeRole.name} with ${replaceRole.name} in ${(
        loadedInMS / 1000
      ).toFixed(4)}s`
    );

    return msg.channel.send(
      makeSimpleEmbed(
        `Replacerole finished in ${(loadedInMS / 1000).toFixed(4)}s.`,
        'GREEN'
      )
    );
  }

  private async debug(
    msg: Message,
    membersWithRole: GuildMember[],
    removeRole: Role,
    replaceRole: Role
  ) {
    const startTime = process.hrtime.bigint();
    for (let i = 0; i < membersWithRole?.length; i++) {
      const user = membersWithRole[i];
      this.log.debug(
        `replacerole: Would remove ${removeRole.name} from user ${user.user.username}`
      );
      msg.channel.send(
        `Would remove \`${removeRole.name}\` from user \`${user.user.username}\``
      );
      this.log.debug(
        `replacerole: Would add ${replaceRole.name} to user ${user.user.username}`
      );
      msg.channel.send(
        `Would add \`${replaceRole.name}\` to user \`${user.user.username}\``
      );
      await timer(100);
    }

    const endTime = process.hrtime.bigint();
    const loadedInMS = convertNanoToMs(endTime - startTime);
    this.log.debug(
      `replacerole: Replaced ${removeRole.name} with ${replaceRole.name} in ${(
        loadedInMS / 1000
      ).toFixed(4)}s`
    );

    return msg.channel.send(
      makeSimpleEmbed(
        `Replacerole finished in ${(loadedInMS / 1000).toFixed(4)}s.`,
        'GREEN'
      )
    );
  }
}
