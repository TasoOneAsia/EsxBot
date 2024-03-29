import { Command, CommandHandler } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { discordCodeBlock, byteToGB, msToFormatted } from '../../utils/miscUtils';
import sysInfo from 'systeminformation';
import { Logger } from 'tslog';

export default class StatusCommand extends Command {
  private readonly _logger: Logger;

  constructor(handler: CommandHandler) {
    super('status', {
      aliases: ['status', 'stats', 'stat'],
      category: 'Misc',
      description: {
        content: 'Returns stats for Guild and Bot',
        usage: 'status',
        examples: ['status'],
      },
      channel: 'guild',
      typing: true,
    });

    this._logger = handler.client.log.getChildLogger({
      name: 'StatusCmd',
      prefix: ['[StatusCmd]'],
    });
  }

  public async exec(msg: Message): Promise<Message | void> {
    const embed = await StatusCommand._createStatsEmbed(msg, <number>this.client.uptime);
    return msg.channel.send(embed || 'An internal error has occured!');
  }

  private static async _createStatsEmbed(
    msg: Message,
    uptime: number
  ): Promise<MessageEmbed | null> {
    const sysMem = await sysInfo.mem();
    if (!msg.guild) return null;
    return (
      new MessageEmbed()
        .setTitle('ESX Guild & Bot Stats')
        .setColor('#00c400')
        .setThumbnail(<string>msg.guild.iconURL())
        .setTimestamp()
        .setFooter(msg.author.tag, msg.author.displayAvatarURL())
        // TODO: Reduce reundant code
        .addFields([
          {
            name: 'Guild Members',
            value: discordCodeBlock(msg.guild.memberCount),
            inline: true,
          },
          {
            name: 'Uptime',
            value: discordCodeBlock(msToFormatted(uptime)),
            inline: true,
          },
          {
            name: 'WS Latency',
            value: discordCodeBlock(msg.client.ws.ping + 'ms'),
            inline: true,
          },
          {
            name: 'Heap Used',
            value: discordCodeBlock(byteToGB(process.memoryUsage().heapUsed) + ' GB'),
            inline: true,
          },
          {
            name: 'Heap Total',
            value: discordCodeBlock(byteToGB(process.memoryUsage().heapTotal) + ' GB'),
            inline: true,
          },
          {
            name: 'Memory',
            value: discordCodeBlock(byteToGB(sysMem.total) + ' GB'),
            inline: true,
          },
        ])
    );
  }
}
