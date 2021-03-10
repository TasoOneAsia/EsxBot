import { Command, CommandHandler } from 'discord-akairo';
import { Logger } from 'tslog';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { DEVELOPER_ROLE_EMOTE, NEWBIE_ROLE_EMOTE, RULES } from '../../config';
import { stripIndent } from 'common-tags';

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
          type: ['rules', 'role'],
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, Please select a valid option for the \`setup\` command (\`rules\`, \`role\`)`,
            retry: (msg: Message) =>
              `${msg.author}, Please select a valid option for the \`setup\` command (\`rules\`, \`role\`)`,
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
    }
    msg.delete({ timeout: 3000 });
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
      .setTitle('React with Your Level')
      .setDescription(
        stripIndent`
        **Please react to this message with the emote you feel represents your skill**

        **Newbie** ${NEWBIE_ROLE_EMOTE} - Newbie to ESX/FiveM without much prior knowledge.
        **Developer** ${DEVELOPER_ROLE_EMOTE} - Well versed with ESX & FiveM and has the skills to develop for it.

        *If you wish to switch roles just remove your previous reaction and add a new one*
      `
      )
      .setFooter('From the ESX Org');

    const sentMsg = await roleChannel.send(embed);
    await sentMsg.react(NEWBIE_ROLE_EMOTE);
    await sentMsg.react(DEVELOPER_ROLE_EMOTE);

    const success = SetupCommand._makeSuccessEmbed('roles');
    return msg.channel.send(success);
  }

  private static _makeSuccessEmbed(command: string): MessageEmbed {
    return new MessageEmbed()
      .setDescription(`Setup **${command}** embed successfully`)
      .setColor('GREEN');
  }
}
