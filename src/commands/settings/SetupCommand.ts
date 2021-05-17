import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import SetupRoleReactManager from '../../client/managers/SetupRoleReactManager';
import { makeSimpleEmbed } from '../../utils';
import RulesManager from '../../client/managers/RulesManager';

interface SetupCommandArgs {
  type: 'role' | 'rules';
  dry: boolean;
}

export default class SetupCommand extends Command {
  private log: Logger;
  constructor(handler: CommandHandler) {
    super('setup', {
      aliases: ['setup'],
      category: 'Admin',
      description: {
        content: 'Setup the server rules or roles reaction',
        usage: 'setup <type> [--dry]',
        examples: ['setup rules', 'setup role --dry'],
      },
      userPermissions: (msg: Message) => {
        if (
          !msg.member!.permissions.has('ADMINISTRATOR') &&
          !handler.client.ownerID.includes(msg.member!.id)
        ) {
          return 'Admin or Owner';
        }
        return null;
      },
      channel: 'guild',
      args: [
        {
          id: 'type',
          type: ['rules', 'role'],
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, Please select a valid option for the \`setup\` command (\`rules\`, \`role\`)`,
            retry: (msg: Message) =>
              `${msg.author}, Please select a valid option for the \`setup\` command (\`rules\`, \`role\`)`,
          },
        },
        {
          id: 'dry',
          flag: '--dry',
          match: 'flag',
        },
      ],
    });

    this.log = handler.client.log.getChildLogger({
      name: 'SetupCmd',
      prefix: ['[SetupCmd]'],
    });
  }

  public async exec(
    msg: Message,
    { type, dry }: SetupCommandArgs
  ): Promise<void | Message> {
    switch (type) {
      case 'role':
        await this.setupRole(msg);
        break;
      case 'rules':
        await this.setupRules(msg, dry);
        break;
    }
  }

  private async setupRules(msg: Message, dry: boolean): Promise<Message> {
    const rawChannelId = this.client.settings.get('rules-channel');

    const rulesManager = this.client.managerHandler.modules.get(
      'rulesManager'
    ) as RulesManager;

    const retrievedRules = await rulesManager.getRules();

    if (!rawChannelId) {
      return msg.channel.send(
        makeSimpleEmbed('Rules channel has not yet been setup!', 'RED')
      );
    }

    const rulesChannel = msg.guild!.channels.cache.get(rawChannelId) as TextChannel;

    const embed = new MessageEmbed()
      .setThumbnail('https://avatars.githubusercontent.com/u/30593074?s=200&v=4')
      .setDescription(
        '*Welcome to the ESX Discord, please read over the following rules before you proceed!*'
      )
      .setTitle('Guild Rules')
      .setTimestamp();

    for (const rule in retrievedRules) {
      embed.addField(`Rule ${parseInt(rule) + 1}`, retrievedRules[rule], false);
    }

    if (dry) {
      const dryEmbed = makeSimpleEmbed(
        `The rules would have been sent to ${rulesChannel}`
      );

      await msg.channel.send(embed);

      return msg.channel.send(dryEmbed);
    }

    await rulesChannel.send(embed);

    const success = SetupCommand._makeSuccessEmbed('rules');

    return msg.channel.send(success);
  }

  private async setupRole(msg: Message): Promise<Message> {
    const reactRoleManager = this.client.managerHandler.modules.get(
      'role-react-manager'
    ) as SetupRoleReactManager;

    // This will rerun the setupRole sequence based on the setting state
    await reactRoleManager.ensureFreshEmbed();

    const embed = SetupCommand._makeSuccessEmbed('role');
    return msg.channel.send(embed);
  }

  private static _makeSuccessEmbed(command: string): MessageEmbed {
    return new MessageEmbed()
      .setDescription(`Setup **${command}** embed successfully`)
      .setColor('GREEN');
  }
}
