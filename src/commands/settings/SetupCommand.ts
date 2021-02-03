import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { RULES } from '../../config';

export default class SetupCommand extends Command {
  private _logger: Logger;
  constructor(handler: CommandHandler) {
    super('setup', {
      aliases: ['setup'],
      category: 'Moderation',
      description: {
        content: 'Setup Server',
        usage: 'setup [type]',
        examples: ['setup rules', 'setup role'],
      },
      userPermissions: ['KICK_MEMBERS'],
      channel: 'guild',
      args: [
        {
          id: 'type',
          prompt: {
            start: (msg: Message) => `${msg.author}, provide a valid type`,
            retry: (msg: Message) => `${msg.author}, provide a valid type to setup`,
          },
        },
      ],
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'SetupCmd',
      prefix: ['[SetupCmd]'],
    });
  }

  public async exec(msg: Message, { type }: { type: string }): Promise<void | Message> {
    switch (type) {
      case 'role':
        await SetupCommand._setupRole(msg);
        break;
      case 'rules':
        await SetupCommand._setupRules(msg);
        break;
      default:
        return msg.reply(
          'Please select a valid option for the `setup` command (`rules`, `role`)'
        );
    }
  }

  private static async _setupRules(msg: Message): Promise<Message> {
    const roleChannel = msg.guild?.channels.cache.get(
      <string>process.env.RULE_CHANNEL
    ) as TextChannel;

    const embed = new MessageEmbed()
      .setThumbnail('https://avatars.githubusercontent.com/u/30593074?s=200&v=4')
      .setDescription(
        '*Welcome to the ESX Discord, please read over the following rules before you proceed!*'
      )
      .setTitle('Guild Rules')
      .setTimestamp();

    for (const rule in RULES) {
      embed.addField(`Rule ${parseInt(rule) + 1}`, RULES[rule], false);
    }

    await roleChannel.send(embed);

    const success = SetupCommand._makeSuccessEmbed('rules');
    return msg.channel.send(success);
  }

  private static async _setupRole(msg: Message): Promise<Message> {
    const roleChannel = msg.guild?.channels.cache.get(
      <string>process.env.REACT_ROLE_CHANNEL
    ) as TextChannel;

    const embed = new MessageEmbed()
      .setTitle('React for a Role')
      .setDescription('Reaction Description')
      .setFooter('React for a role');

    const sentMsg = await roleChannel.send(embed);
    await sentMsg.react('👍');
    await sentMsg.react('👎');

    const success = SetupCommand._makeSuccessEmbed('roles');
    return msg.channel.send(success);
  }

  private static _makeSuccessEmbed(command: string): MessageEmbed {
    return new MessageEmbed()
      .setDescription(`Setup **${command}** embed successfully`)
      .setColor('GREEN');
  }
}
